import { Metadata } from 'next';
import Register from '@/components/Register';

export const metadata: Metadata = {
  title: 'Register | internX Engineering Simulation',
  description: 'Register for internX to gain hands-on engineering experience, agile sprint workflows, and real project simulations.',
};

export default function RegisterPage() {
  return <Register />;
}
