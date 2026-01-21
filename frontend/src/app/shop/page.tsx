import { Metadata } from 'next';
import ShopClient from './ShopClient';  

export const metadata: Metadata = {
  title: "Cafe Prince | Shop",
  description: "A cafe ordering website.",
};

export default function ShopPage() {
  return <ShopClient />;  
}