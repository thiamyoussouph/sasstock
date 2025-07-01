'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { PaymentType } from '@/types/sale';

interface PaymentModalProps {
    saleId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payment: {
        amount: number;
        montantRecu: number;
        monnaieRendue: number;
        method: PaymentType;
        note?: string;
    }) => void;
}

export default function PaymentModal({ saleId, isOpen, onClose, onSubmit }: PaymentModalProps) {
    const [method, setMethod] = useState<PaymentType>('CASH');
    const [montantRecu, setMontantRecu] = useState<number>(0);
    const [note, setNote] = useState('');
    const [total, setTotal] = useState(0);
    const [amountRemaining, setAmountRemaining] = useState(0);
    const [loading, setLoading] = useState(true);

    const monnaieRendue = montantRecu - amountRemaining;

    useEffect(() => {
        if (isOpen && saleId) {
            setLoading(true);
            fetch(`/api/sales/${saleId}/payments`)
                .then(res => res.json())
                .then(data => {
                    setTotal(data.total);
                    setAmountRemaining(data.amountRemaining);
                    setMontantRecu(data.amountRemaining);
                    setLoading(false);
                })
                .catch(err => {
                    toast.error('Erreur chargement paiement');
                    setLoading(false);
                });
        }
    }, [isOpen, saleId]);

    const handleConfirm = () => {
        if (montantRecu < amountRemaining) {
            toast.error("Montant insuffisant");
            return;
        }

        onSubmit({
            amount: amountRemaining,
            montantRecu,
            monnaieRendue,
            method,
            note: note || undefined,
        });

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Paiement de la vente</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <p className="text-sm">Chargement...</p>
                ) : amountRemaining === 0 ? (
                    <p className="text-green-600 font-semibold">Cette vente est déjà entièrement payée.</p>
                ) : (
                    <div className="space-y-2">
                        <Label>Montant total</Label>
                        <Input type="text" value={total.toFixed(2) + ' FCFA'} disabled />

                        <Label>Montant restant à payer</Label>
                        <Input type="text" value={amountRemaining.toFixed(2) + ' FCFA'} disabled />

                        <Label>Montant reçu</Label>
                        <Input
                            type="number"
                            value={montantRecu}
                            onChange={(e) => setMontantRecu(Number(e.target.value))}
                        />

                        <Label>Monnaie à rendre</Label>
                        <Input type="text" value={monnaieRendue.toFixed(2) + ' FCFA'} disabled />

                        <Label>Moyen de paiement</Label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={method}
                            onChange={(e) => setMethod(e.target.value as PaymentType)}
                        >
                            <option value="CASH">Espèces</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                            <option value="CARD">Carte</option>
                        </select>

                        <Label>Note</Label>
                        <Input
                            type="text"
                            placeholder="Note optionnelle"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleConfirm}
                        disabled={amountRemaining === 0 || montantRecu < amountRemaining}
                    >
                        Confirmer le paiement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
