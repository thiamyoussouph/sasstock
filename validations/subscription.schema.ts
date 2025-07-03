import { z } from "zod";

export const createSubscriptionSchema = z.object({
    companyId: z.string().min(1, "L'entreprise est requise"),
    planId: z.string().min(1, "Le plan est requis"),
    durationInMonths: z
        .number()
        .min(1, "La durée doit être d’au moins 1 mois")
        .max(24, "Durée maximale : 24 mois"),
});

export const subscriptionStatusEnum = z.enum([
    "ACTIVE",
    "EXPIRED",
    "CANCELLED",
    "PENDING",
]);

export const paymentStatusEnum = z.enum(["PAID", "UNPAID", "FAILED"]);

export const createSubscriptionPaymentSchema = z.object({
    subscriptionId: z.string().min(1, "Abonnement requis"),
    amount: z.number().min(1, "Montant requis"),
    paymentMethod: z.string().min(2, "Méthode de paiement requise"),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CreateSubscriptionPaymentInput = z.infer<
    typeof createSubscriptionPaymentSchema
>;
