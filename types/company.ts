// types/company.ts

import { z } from 'zod';
import { Plan } from './plan'; // 🔁 Assure-toi que ce fichier existe

export const CompanySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  planId: z.string().optional().nullable(),
  signatureUrl: z.string().url().optional().nullable(),
  stampUrl: z.string().url().optional().nullable(),
  invoicePrefix: z.string().min(1).default('FAC'),
});

// 🔁 Pour les données manipulées en front et enrichies avec `plan`
export type Company = z.infer<typeof CompanySchema> & {
  plan?: Plan | null; // ✅ Ajout ici pour corriger l'erreur
};

export type CreateCompanyPayload = z.infer<typeof CompanySchema>;
export type UpdateCompanyPayload = z.infer<typeof CompanySchema> & { id: string };
