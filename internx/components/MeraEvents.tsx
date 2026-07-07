"use client"
import React from 'react'

const MeraEvents = () => {
  const Link:string = "https://www.meraevents.com/ticketWidget?eventId=270783&ucode=organizer&wcode=9063CD-9063CD-333333-9063CD-&theme=1&samepage=1"
  return (
    <div>
        <button
              onClick={() => { window.open(Link, "_blank") }}
              className="bg-[#ff1a1a] hover:bg-[#ff3333] transition-colors text-white rounded-full font-medium hover:cursor-pointer"
              style={{ fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', padding: 'clamp(0.55rem, 1.5vw, 0.875rem) clamp(1.5rem, 4vw, 2.5rem)' }}
            >
              Register Now
            </button>
    </div>
  )
}

export default MeraEvents