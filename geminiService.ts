
import { Order, OrderItem, SalesSource } from './types';

// Mock AI Service for demo purposes since npm/node_modules are unavailable.
// Uncomment imports and implementation when @google/genai is installed.

/*
import { GoogleGenAI, Type } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
*/

export const extractOrderFromText = async (text: string): Promise<any> => {
  console.log("Mock AI extracting from text:", text);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

  // Basic heuristic parsing for demo
  const isCap = text.toLowerCase().includes('cap');
  const isShoes = text.toLowerCase().includes('shoe');
  const amount = text.match(/\d+/g)?.[0] || "5000";

  return {
    customerName: "Guest Customer",
    items: [
      { name: isCap ? 'Native Cap' : 'Fashion Item', quantity: 1, price: parseInt(amount) || 5000, id: Date.now().toString() }
    ],
    totalAmount: parseInt(amount) || 5000,
    deliveryFee: 1500,
    source: "WhatsApp"
  };
};

export const extractOrderFromImage = async (base64Data: string): Promise<any> => {
  console.log("Mock AI extracting from image");
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    customerName: "Image Extracted User",
    items: [
      { name: 'Snapshot Item', quantity: 2, price: 8500, id: Date.now().toString() }
    ],
    totalAmount: 17000,
    deliveryFee: 2000,
    source: "Instagram"
  };
};

export const verifyPaymentProof = async (base64Data: string): Promise<any> => {
  console.log("Mock AI verifying payment");
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    amount: 15000,
    date: new Date().toISOString(),
    sender: "Verified Sender"
  };
};
