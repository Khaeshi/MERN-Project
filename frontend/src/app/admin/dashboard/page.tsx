import { Metadata } from 'next';
import DashboardClient from './DashboardClient';  

export const metadata: Metadata = {
  title: "Admin Dashboard - Cafe Prince",
  description: "Manage menu items and admin functions for Cafe Prince.",

};

export default function AdminDashboardPage() {
  return <DashboardClient />; 
}