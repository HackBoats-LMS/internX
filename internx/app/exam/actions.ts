'use server'

import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import ExamConfig from '@/models/ExamConfig'
import Question from '@/models/Question'
import QuestionSet from '@/models/QuestionSet'
import College from '@/models/College'
import Department from '@/models/Department'
import ExamAttempt from '@/models/ExamAttempt'
import DescriptiveAnswer from '@/models/DescriptiveAnswer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getFromRedisOrDb, invalidateRedisTag } from '@/lib/redis'
import bcrypt from 'bcryptjs'

// --- Cached Helpers ---
const getCachedValidSets = async () => getFromRedisOrDb(
    'valid-question-sets',
    async () => {
        await dbConnect()
        const setsWithQuestions = await Question.distinct('setName')
        return setsWithQuestions.filter((s: string) => s && s.trim() !== '')
    }
)

const getCachedQuestionsForSet = async (setName: string) => getFromRedisOrDb(
    `questions-by-set:${setName}`,
    async () => {
        await dbConnect()
        const questions = await Question.find(
            { setName },
            { correctOption: 0 }
        ).sort({ sectionName: 1, createdAt: 1 }).lean()
        return JSON.parse(JSON.stringify(questions))
    }
)

const getCachedQuestionsWithAnswersForSet = async (setName: string) => getFromRedisOrDb(
    `questions-answers-by-set:${setName}`,
    async () => {
        await dbConnect()
        const questions = await Question.find({ setName }).lean()
        return JSON.parse(JSON.stringify(questions))
    }
)

// --- Helpers ---
const getSessionUser = async () => {
    const session = await getServerSession(authOptions)
    return session?.user as any
}

/**
 * Require an authenticated session and (optionally) that the caller owns
 * `targetUserId`. Throws Unauthorized otherwise. Used to close the IDOR holes
 * where any caller could pass an arbitrary userId/attemptId.
 */
const requireUser = async (targetUserId?: string) => {
    const user = await getSessionUser()
    if (!user) throw new Error("Unauthorized")
    if (targetUserId && user.id !== targetUserId) throw new Error("Unauthorized")
    return user
}

/** Strip sensitive fields (password hash) before returning a user document. */
const sanitizeUser = (u: any) => {
    if (!u) return u
    const { password, ...rest } = typeof u.toJSON === 'function' ? u.toJSON() : { ...u }
    return rest
}

const isAdmin = async () => {
    const user = await getSessionUser()
    if (!user) return false
    if (user.id === 'admin-id') return true
    if (user.role === 'admin') return true

    await dbConnect()
    if (!user.id.match(/^[0-9a-fA-F]{24}$/)) return false

    const dbUser = await User.findById(user.id)
    return dbUser?.role === 'admin'
}

// --- Admin Actions ---

export async function fetchAdminData() {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()

    let config = await ExamConfig.findOne({}).lean()
    if (!config) config = await ExamConfig.create({ timeLimit: 30, numQuestions: 10 })

    let sets = await QuestionSet.find({}).sort({ createdAt: 1 }).lean()
    if (sets.length === 0) {
        await QuestionSet.create({ name: 'Default Set' })
        sets = await QuestionSet.find({}).sort({ createdAt: 1 }).lean()
    }

    const questions = await Question.find({}).sort({ createdAt: 1 }).lean()
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).lean()

    const userIds = users.map((u: any) => u._id.toString())
    const allAttempts = await ExamAttempt.find({ userId: { $in: userIds } })
        .sort({ startedAt: -1 })
        .lean()

    const rawDescriptiveAnswers = await DescriptiveAnswer.find({})
        .populate('questionId')
        .sort({ createdAt: -1 })
        .lean()

    const userMapForDescriptive = new Map<string, any>(users.map((u: any) => [u._id.toString(), u]))
    const descriptiveAnswers = rawDescriptiveAnswers.map((da: any) => {
        const u = userMapForDescriptive.get(da.userId)
        return {
            ...da,
            _id: da._id.toString(),
            questionId: da.questionId ? {
                ...da.questionId,
                _id: (da.questionId as any)._id?.toString()
            } : null,
            examAttemptId: da.examAttemptId?.toString(),
            user: u ? {
                fullName: u.fullName,
                email: u.email,
                rollNo: u.rollNo,
                college: u.college,
                department: u.department
            } : null
        }
    })

    const attemptMap = new Map<string, any>()
    for (const attempt of allAttempts) {
        const uid = attempt.userId.toString()
        if (!attemptMap.has(uid)) {
            attemptMap.set(uid, attempt)
        }
    }

    const usersWithAttempts = users.map((u: any) => {
        const attempt = attemptMap.get(u._id.toString())
        return {
            ...u,
            _id: u._id.toString(),
            exam_attempts: attempt ? [{
                score: attempt.score,
                totalQuestions: attempt.totalQuestions,
                status: attempt.status,
                completed_at: attempt.completedAt
            }] : []
        }
    })

    const colleges = await College.find({}).lean()
    const departments = await Department.find({}).populate('collegeId').lean()

    return {
        config: JSON.parse(JSON.stringify(config)),
        sets: JSON.parse(JSON.stringify(sets)),
        questions: JSON.parse(JSON.stringify(questions)),
        users: JSON.parse(JSON.stringify(usersWithAttempts)),
        colleges: JSON.parse(JSON.stringify(colleges)),
        departments: JSON.parse(JSON.stringify(departments)),
        descriptiveAnswers: JSON.parse(JSON.stringify(descriptiveAnswers))
    }
}

export async function createSet(name: string) {
    if (!await isAdmin()) throw new Error('Unauthorized')
    await dbConnect()
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Set name cannot be empty')
    const existing = await QuestionSet.findOne({ name: trimmed })
    if (existing) throw new Error(`Set "${trimmed}" already exists`)
    const set = await QuestionSet.create({ name: trimmed })
    revalidatePath('/exam/admin')
    await invalidateRedisTag('question')
    return JSON.parse(JSON.stringify(set))
}

export async function deleteSet(id: string) {
    if (!await isAdmin()) throw new Error('Unauthorized')
    await dbConnect()
    const set = await QuestionSet.findById(id)
    if (!set) throw new Error('Set not found')
    await Question.deleteMany({ setName: set.name })
    await QuestionSet.findByIdAndDelete(id)
    revalidatePath('/exam/admin')
    await invalidateRedisTag('question')
    return { success: true }
}

export async function updateConfig(timeLimit: number, numQuestions: number) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    await ExamConfig.findOneAndUpdate({}, { timeLimit, numQuestions, updatedAt: new Date() }, { upsert: true })
    revalidatePath('/exam/admin')
    await invalidateRedisTag('config')
    return { success: true }
}

export async function addQuestion(text: string, options: string[], correctOption: number, setName: string, sectionName: string, type: string = 'mcq') {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()

    const cleanSetName = (setName || '').trim() || 'Default Set'
    const cleanSectionName = (sectionName || '').trim() || 'General'

    if (!text || (type === 'mcq' && (!options || options.length < 4))) throw new Error('Invalid question data')

    const newQuestionData: any = {
        questionText: text.trim(),
        setName: cleanSetName,
        sectionName: cleanSectionName,
        type: type
    }

    if (type === 'mcq') {
        newQuestionData.options = options.map(o => o.trim())
        newQuestionData.correctOption = Number(correctOption)
    } else {
        newQuestionData.options = []
        newQuestionData.correctOption = 0
    }

    await Question.create(newQuestionData)
    revalidatePath('/exam/admin')
    await invalidateRedisTag('question')
    return { success: true }
}

export async function updateQuestion(id: string, text: string, options: string[], correctOption: number, setName: string, sectionName: string, type: string = 'mcq') {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()

    const cleanSetName = (setName || '').trim() || 'Default Set'
    const cleanSectionName = (sectionName || '').trim() || 'General'

    if (!text || (type === 'mcq' && (!options || options.length < 4))) throw new Error('Invalid question data')

    const updateData: any = {
        questionText: text.trim(),
        setName: cleanSetName,
        sectionName: cleanSectionName,
        type: type
    }

    if (type === 'mcq') {
        updateData.options = options.map(o => o.trim())
        updateData.correctOption = Number(correctOption)
    } else {
        updateData.options = []
        updateData.correctOption = 0
    }

    await Question.findByIdAndUpdate(id, updateData, { new: true })
    revalidatePath('/exam/admin')
    await invalidateRedisTag('question')
    return { success: true }
}

export async function deleteQuestion(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    await Question.findByIdAndDelete(id)
    revalidatePath('/exam/admin')
    await invalidateRedisTag('question')
    return { success: true }
}

export async function updateSectionName(setName: string, oldSectionName: string, newSectionName: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()

    const cleanSetName = (setName || '').trim() || 'Default Set'
    const cleanOldSection = (oldSectionName || '').trim()
    const cleanNewSection = (newSectionName || '').trim()

    if (!cleanOldSection || !cleanNewSection) throw new Error('Invalid section name')

    await Question.updateMany(
        { setName: cleanSetName, sectionName: cleanOldSection },
        { $set: { sectionName: cleanNewSection } }
    )

    revalidatePath('/exam/admin')
    await invalidateRedisTag('question')
    return { success: true }
}

export async function addCollege(name: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    await College.create({ name })
    revalidatePath('/exam/admin')
    return { success: true }
}

export async function deleteCollege(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    await College.findByIdAndDelete(id)
    revalidatePath('/exam/admin')
    return { success: true }
}

export async function addDepartment(name: string, collegeId?: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    const payload: any = { name }
    if (collegeId && collegeId.trim()) payload.collegeId = collegeId.trim()
    await Department.create(payload)
    revalidatePath('/exam/admin')
    return { success: true }
}

export async function deleteDepartment(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    await Department.findByIdAndDelete(id)
    revalidatePath('/exam/admin')
    return { success: true }
}

export async function deleteUser(id: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()
    await User.findByIdAndDelete(id)
    await ExamAttempt.deleteMany({ userId: id })
    revalidatePath('/exam/admin')
    return { success: true }
}

export async function resetExam(userId: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()

    const attempt = await ExamAttempt.findOne({ userId }).sort({ startedAt: -1 })
    if (!attempt) return { success: false, message: "No exam attempt found" }

    const oldSet = attempt.assignedSet
    await ExamAttempt.findByIdAndDelete(attempt._id)

    const validSets = await getCachedValidSets()
    let assignedSet = 'Default Set'
    if (validSets.length > 1) {
        const otherSets = validSets.filter(s => s !== oldSet)
        assignedSet = otherSets[Math.floor(Math.random() * otherSets.length)]
    } else if (validSets.length === 1) {
        assignedSet = validSets[0]
    }

    await ExamAttempt.create({
        userId,
        status: 'started',
        startedAt: new Date(),
        assignedSet
    })

    revalidatePath('/exam/admin')
    return { success: true }
}

export async function changeAdminPassword(newPassword: string) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters")

    await dbConnect()
    const user = await getSessionUser()
    const adminUser = await User.findById(user.id)

    if (!adminUser || adminUser.role !== 'admin') throw new Error("Admin not found")

    // Hash before storing — never persist a plaintext password.
    adminUser.password = await bcrypt.hash(newPassword, 10)
    await adminUser.save()

    return { success: true }
}

// --- User Actions ---

export async function getProfile(id: string) {
    // Require an authenticated session. A caller may only fetch their own
    // profile (admins may fetch any). Prevents unauthenticated PII + password
    // hash disclosure via arbitrary id/email/rollNo/mobile.
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error("Unauthorized")
    if (id !== sessionUser.id && (sessionUser.role as string) !== 'admin') {
        throw new Error("Unauthorized")
    }

    if (id === 'admin-id') {
        return {
            _id: 'admin-id',
            fullName: 'Administrator',
            email: process.env.ADMIN_EMAIL || 'admin@internx.com',
            role: 'admin'
        }
    }

    await dbConnect()
    let user = null
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(id)
    }
    if (!user && id) {
        user = await User.findOne({
            $or: [
                { email: id.toLowerCase() },
                { rollNo: id },
                { mobile: id }
            ]
        })
    }
    // Never return the password hash to the client.
    return user ? JSON.parse(JSON.stringify(sanitizeUser(user))) : null
}

export async function upsertProfile(data: any) {
    const user = await getSessionUser()
    if (!user) throw new Error("Unauthorized")

    await dbConnect()

    // SECURITY: role is always taken from the authenticated session, never from
    // client input. This prevents a student from escalating to admin by sending
    // role:'admin'. The record updated is always the caller's own (by session id
    // or email) — a client-supplied data.id is ignored to avoid IDOR.
    const sessionRole = (user.role as string) === 'admin' ? 'admin' : 'student'

    const update = {
        email: (user.email || '').toLowerCase().trim(),
        fullName: data.full_name || user.name || 'Exam Candidate',
        college: data.college,
        department: data.department,
        section: data.section,
        rollNo: data.roll_no,
        year: data.year,
        semester: data.semester,
        mobile: data.mobile,
        whatsapp: data.whatsapp,
        role: sessionRole
    }

    if (user.id && user.id.match(/^[0-9a-fA-F]{24}$/)) {
        await User.findByIdAndUpdate(user.id, update, { new: true, upsert: true })
    } else {
        await User.findOneAndUpdate(
            { email: update.email },
            update,
            { new: true, upsert: true }
        )
    }
    return { success: true }
}

export async function addExamCandidate(candidate: {
    fullName: string
    email: string
    rollNo?: string
    mobile?: string
    college?: string
    department?: string
    section?: string
    password?: string
}) {
    if (!await isAdmin()) throw new Error("Unauthorized")
    await dbConnect()

    const normEmail = candidate.email.toLowerCase().trim()
    const rawPassword = candidate.password?.trim() || 'password123'
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const userDoc = await User.findOneAndUpdate(
        { email: normEmail },
        {
            email: normEmail,
            fullName: candidate.fullName.trim(),
            rollNo: candidate.rollNo?.trim() || '',
            mobile: candidate.mobile?.trim() || '',
            whatsapp: candidate.mobile?.trim() || '',
            college: candidate.college?.trim() || 'Engineering Campus',
            department: candidate.department?.trim() || 'Computer Science',
            section: candidate.section?.trim() || 'A',
            password: hashedPassword,
            role: 'student'
        },
        { new: true, upsert: true }
    )

    revalidatePath('/exam/admin')
    return { success: true, user: JSON.parse(JSON.stringify(userDoc)) }
}

export async function getColleges() {
    await dbConnect()
    const colleges = await College.find({})
    return JSON.parse(JSON.stringify(colleges))
}

export async function getDepartments() {
    await dbConnect()
    const departments = await Department.find({}).populate('collegeId')
    const flatDepts = departments.map((d: any) => ({
        id: d._id.toString(),
        name: d.name,
        college_id: d.collegeId?._id.toString(),
        colleges: { name: d.collegeId?.name }
    }))
    return JSON.parse(JSON.stringify(flatDepts))
}

// --- Exam Actions ---

export async function checkExamStatus(userId: string) {
    await requireUser(userId)
    await dbConnect()
    const attempt = await ExamAttempt.findOne({ userId }).sort({ startedAt: -1 }).lean()
    if (attempt && (attempt.status === 'completed' || attempt.status === 'terminated')) {
        return 'completed'
    }
    return attempt ? attempt.status : null
}

export async function startExam(userId: string) {
    await requireUser(userId)
    await dbConnect()

    const existing = await ExamAttempt.findOne({ userId }).sort({ startedAt: -1 })
    const validSets = await getCachedValidSets()

    if (existing && existing.status === 'started') {
        const needsReassign = !existing.assignedSet ||
            existing.assignedSet.trim() === '' ||
            !validSets.includes(existing.assignedSet)

        if (!needsReassign) {
            return JSON.parse(JSON.stringify(existing))
        }
    } else if (existing) {
        return JSON.parse(JSON.stringify(existing))
    }

    const assignedSet = validSets.length > 0
        ? validSets[Math.floor(Math.random() * validSets.length)]
        : 'Default Set'

    if (existing) {
        existing.assignedSet = assignedSet
        await existing.save()
        return JSON.parse(JSON.stringify(existing))
    }

    const newAttempt = await ExamAttempt.create({
        userId,
        status: 'started',
        startedAt: new Date(),
        assignedSet
    })
    return JSON.parse(JSON.stringify(newAttempt))
}

export const getExamConfig = async () => getFromRedisOrDb(
    'exam-config',
    async () => {
        await dbConnect()
        const config = await ExamConfig.findOne({}).lean()
        return config ? JSON.parse(JSON.stringify(config)) : { timeLimit: 30 }
    }
)

export async function fetchQuestions(attemptId: string) {
    const user = await getSessionUser()
    if (!user) throw new Error("Unauthorized")
    await dbConnect()
    const attempt = await ExamAttempt.findById(attemptId).lean()
    if (!attempt) return []
    // Ownership check: only the owner of the attempt may fetch its questions.
    if (attempt.userId?.toString() !== user.id) throw new Error("Unauthorized")

    const questions = await getCachedQuestionsForSet(attempt.assignedSet)

    const seedString = attemptId.toString()
    let h = 0
    for (let i = 0; i < seedString.length; i++) {
        h = Math.imul(31, h) + seedString.charCodeAt(i) | 0
    }

    let a = h
    const random = () => {
        let t = a += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }

    const bySection: Record<string, any[]> = {}
    for (const q of questions) {
        const sec = q.sectionName || 'General'
        if (!bySection[sec]) bySection[sec] = []
        bySection[sec].push(q)
    }

    const sections = Object.keys(bySection)
    for (let i = sections.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [sections[i], sections[j]] = [sections[j], sections[i]]
    }

    const shuffled: any[] = []
    for (const sec of sections) {
        const secQs = bySection[sec]
        for (let i = secQs.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [secQs[i], secQs[j]] = [secQs[j], secQs[i]]
        }
        shuffled.push(...secQs)
    }

    return shuffled
}

export async function submitExam(attemptId: string, answers: Record<string, number | string>, status: string) {
    const user = await getSessionUser()
    if (!user) throw new Error("Unauthorized")
    await dbConnect()
    const attempt = await ExamAttempt.findById(attemptId)
    if (!attempt) throw new Error("Attempt not found")
    // Ownership check: only the owner may submit. Prevents overwriting others.
    if (attempt.userId?.toString() !== user.id) throw new Error("Unauthorized")
    // Idempotency: an already-finalized attempt cannot be re-submitted/overwritten.
    if (attempt.status === 'completed' || attempt.status === 'terminated') {
        throw new Error("This attempt has already been submitted.")
    }

    // Server-side time enforcement (H7): reject submissions after the configured
    // window (small grace period for latency). The client timer is only UX.
    try {
        const config = await getExamConfig()
        const timeLimitMin = Number(config?.timeLimit) || 30
        const startedAt = new Date(attempt.startedAt).getTime()
        const elapsedMs = Date.now() - startedAt
        const graceMs = 2 * 60 * 1000 // 2-minute grace for network latency
        if (elapsedMs > timeLimitMin * 60 * 1000 + graceMs) {
            // Mark as terminated rather than scoring a late submission.
            await ExamAttempt.findByIdAndUpdate(attemptId, {
                status: 'terminated',
                totalQuestions: (await getCachedQuestionsWithAnswersForSet(attempt.assignedSet))
                    .filter((q: any) => q.type !== 'descriptive' && !(q.options && q.options.length === 0)).length,
                completedAt: new Date()
            })
            throw new Error("Time limit exceeded. Your exam was auto-submitted.")
        }
    } catch (cfgErr: any) {
        // Re-throw time-limit errors; ignore config lookup issues otherwise.
        if (cfgErr?.message?.includes('Time limit exceeded')) throw cfgErr
    }

    let score = 0
    const questions = await getCachedQuestionsWithAnswersForSet(attempt.assignedSet)
    const questionMap = new Map<string, { correctOption: number, type?: string, [key: string]: any }>(
        questions.map((q: any) => [q._id.toString(), q])
    )

    const descriptiveAnswersToSave: any[] = []

    for (const [qId, selectedOpt] of Object.entries(answers)) {
        const q = questionMap.get(qId)
        if (!q) continue

        const isDescriptive = q.type === 'descriptive' || (q.options && q.options.length === 0)

        if (isDescriptive) {
            if (selectedOpt !== undefined && selectedOpt !== '') {
                descriptiveAnswersToSave.push({
                    userId: attempt.userId,
                    questionId: qId,
                    examAttemptId: attemptId,
                    setName: attempt.assignedSet,
                    answerText: String(selectedOpt)
                })
            }
        } else {
            if (q.correctOption === Number(selectedOpt)) {
                score++
            }
        }
    }

    const totalQuestions = questions.filter((q: any) => q.type !== 'descriptive' && !(q.options && q.options.length === 0)).length

    if (descriptiveAnswersToSave.length > 0) {
        await DescriptiveAnswer.create(descriptiveAnswersToSave)
    }

    await ExamAttempt.findByIdAndUpdate(attemptId, {
        score,
        status,
        totalQuestions,
        completedAt: new Date()
    })

    return { success: true }
}

export async function getResult(userId: string) {
    await requireUser(userId)
    await dbConnect()
    const attempt = await ExamAttempt.findOne({ userId }).sort({ startedAt: -1 }).lean()
    return attempt ? JSON.parse(JSON.stringify(attempt)) : null
}

export async function getDescriptiveAnswers(userId: string) {
    await requireUser(userId)
    await dbConnect()
    const answers = await DescriptiveAnswer.find({ userId })
        .populate('questionId')
        .sort({ createdAt: -1 })
        .lean()
    return JSON.parse(JSON.stringify(answers))
}
