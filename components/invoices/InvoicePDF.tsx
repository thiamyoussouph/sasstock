import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface Props {
    invoiceNumber: string;
    emitterName: string;
    emitterAddress: string;
    emitterPhone: string;
    emitterEmail: string;
    clientName: string;
    clientAddress: string;
    date?: string;
    dueDate?: string;
    products: { quantity: number; description: string; unitPrice: number; total: number }[];
    tvaRate: number;
    tvaEnabled: boolean;
    signatureUrl?: string;
    stampUrl?: string;
}

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    section: {
        marginBottom: 10,
    },
    table: {
        width: 'auto',
        marginVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCol: {
        width: '20%',
        padding: 5,
        border: '1 solid #ccc',
    },
    tableColDesc: {
        width: '40%',
        padding: 5,
        border: '1 solid #ccc',
    },
    total: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        fontSize: 11,
    },
    img: {
        height: 60,
        marginVertical: 10,
    },
});

export default function InvoicePDF({
    invoiceNumber,
    emitterName,
    emitterAddress,
    clientName,
    clientAddress,
    date,
    dueDate,
    products,
    tvaRate,
    tvaEnabled,
    signatureUrl,
    stampUrl,
}: Props) {
    const totalHT = products.reduce((acc, p) => acc + p.total, 0);
    const totalTVA = tvaEnabled ? (totalHT * tvaRate) / 100 : 0;
    const totalTTC = totalHT + totalTVA;

    const formatSafeDate = (value?: string) => {
        if (!value) return '—';
        const d = new Date(value);
        return isNaN(d.getTime()) ? '—' : format(d, 'dd MMMM yyyy');
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>FACTURE</Text>
                    <View>
                        <Text>Facture n° {invoiceNumber}</Text>
                        <Text>Date : {formatSafeDate(date)}</Text>
                        <Text>Échéance : {formatSafeDate(dueDate)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text>Émetteur :</Text>
                            <Text>{emitterName}</Text>
                            <Text>{emitterAddress}</Text>
                        </View>
                        <View>
                            <Text>Client :</Text>
                            <Text>{clientName}</Text>
                            <Text>{clientAddress}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCol}>#</Text>
                        <Text style={styles.tableColDesc}>Description</Text>
                        <Text style={styles.tableCol}>Qté</Text>
                        <Text style={styles.tableCol}>PU</Text>
                        <Text style={styles.tableCol}>Total</Text>
                    </View>
                    {products.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.tableCol}>{i + 1}</Text>
                            <Text style={styles.tableColDesc}>{item.description}</Text>
                            <Text style={styles.tableCol}>{item.quantity}</Text>
                            <Text style={styles.tableCol}>{item.unitPrice.toFixed(2)} €</Text>
                            <Text style={styles.tableCol}>{item.total.toFixed(2)} €</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.total}>
                    <View>
                        <Text>Total HT : {totalHT.toFixed(2)} €</Text>
                        {tvaEnabled && <Text>TVA ({tvaRate}%) : {totalTVA.toFixed(2)} €</Text>}
                        <Text style={{ fontWeight: 'bold' }}>Total TTC : {totalTTC.toFixed(2)} €</Text>
                    </View>
                </View>

                {(signatureUrl || stampUrl) && (
                    <View style={{ flexDirection: 'row', marginTop: 20, gap: 20 }}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        {signatureUrl && <Image src={signatureUrl} style={styles.img} />}
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        {stampUrl && <Image src={stampUrl} style={styles.img} />}
                    </View>
                )}

            </Page>
        </Document>
    );
}
