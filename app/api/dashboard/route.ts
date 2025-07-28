// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_ladygest';

interface JwtPayload {
  companyId: string;
  userId?: string;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ 
      message: 'Token d\'authentification requis',
      code: 'NO_TOKEN' 
    }, { status: 401 });
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    const companyId = decoded.companyId;

    if (!companyId) {
      return NextResponse.json({ 
        message: 'Token invalide: companyId manquant',
        code: 'INVALID_TOKEN' 
      }, { status: 401 });
    }

    // Récupérer le paramètre type depuis l'URL
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // === STATISTIQUES GÉNÉRALES (par défaut) ===
    if (!type || type === 'stats') {
      try {
        const [productsCount, customersCount, salesCount, salesTotalData] = await Promise.all([
          prisma.product.count({ where: { companyId } }),
          prisma.customer.count({ where: { companyId } }),
          prisma.sale.count({ where: { companyId } }),
          prisma.sale.aggregate({
            where: { companyId },
            _sum: { total: true },
          })
        ]);

        return NextResponse.json({
          productsCount,
          customersCount,
          salesCount,
          salesTotal: salesTotalData._sum.total || 0,
        });
      } catch (dbError) {
        console.error('Erreur base de données (stats):', dbError);
        return NextResponse.json({ 
          message: 'Erreur lors du chargement des statistiques',
          code: 'DB_ERROR' 
        }, { status: 500 });
      }
    }

    // === DONNÉES GRAPHIQUE VENTES ===
    if (type === 'sales-chart') {
      try {
        // Données journalières (7 derniers jours)
        const dailyData = await prisma.$queryRaw`
          SELECT 
            DATE(createdAt) as date, 
            SUM(total) as total
          FROM Sale 
          WHERE companyId = ${companyId} 
            AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(createdAt)
          ORDER BY date ASC
        ` as Array<{ date: Date; total: number }>;

        // Données hebdomadaires (8 dernières semaines)
        const weeklyData = await prisma.$queryRaw`
          SELECT 
            WEEK(createdAt) as week, 
            SUM(total) as total
          FROM Sale 
          WHERE companyId = ${companyId} 
            AND createdAt >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
          GROUP BY WEEK(createdAt)
          ORDER BY week ASC
        ` as Array<{ week: number; total: number }>;

        // Données mensuelles (6 derniers mois)
        const monthlyData = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(createdAt, '%Y-%m') as month, 
            SUM(total) as total
          FROM Sale 
          WHERE companyId = ${companyId} 
            AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
          ORDER BY month ASC
        ` as Array<{ month: string; total: number }>;

        // Formatage des données
        const formatDaily = dailyData.map(item => ({
          date: new Date(item.date).toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          total: Number(item.total) || 0
        }));

        const formatWeekly = weeklyData.map(item => ({
          week: item.week.toString(),
          total: Number(item.total) || 0
        }));

        const formatMonthly = monthlyData.map(item => ({
          month: new Date(item.month + '-01').toLocaleDateString('fr-FR', { 
            month: 'short', 
            year: 'numeric' 
          }),
          total: Number(item.total) || 0
        }));

        return NextResponse.json({
          daily: formatDaily,
          weekly: formatWeekly,
          monthly: formatMonthly,
        });
      } catch (dbError) {
        console.error('Erreur base de données (sales-chart):', dbError);
        return NextResponse.json({ 
          message: 'Erreur lors du chargement des données de ventes',
          code: 'DB_ERROR' 
        }, { status: 500 });
      }
    }

    // === ALERTES DE STOCK ===
    if (type === 'stock-alerts') {
      try {
        // Récupérer les produits avec stock critique
        const stockAlerts = await prisma.product.findMany({
          where: {
            companyId,
            isActive: true,
            OR: [
              {
                quantity: {
                  lte: prisma.product.fields.stockMin // quantity <= stockMin
                }
              },
              {
                quantity: 0 // Rupture de stock
              }
            ]
          },
          select: {
            id: true,
            name: true,
            quantity: true,
            stockMin: true,
            category: {
              select: {
                name: true
              }
            }
          },
          orderBy: [
            { quantity: 'asc' }, // Les plus critiques en premier
            { name: 'asc' }
          ],
          take: 10 // Limiter à 10 alertes pour ne pas surcharger
        });

        // Formater les données
        const formattedAlerts = stockAlerts.map(product => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          stockMin: product.stockMin,
          category: product.category?.name || 'Sans catégorie',
          severity: product.quantity === 0 ? 'critical' : 'warning'
        }));

        return NextResponse.json(formattedAlerts);
      } catch (dbError) {
        console.error('Erreur base de données (stock-alerts):', dbError);
        return NextResponse.json({ 
          message: 'Erreur lors du chargement des alertes de stock',
          code: 'DB_ERROR' 
        }, { status: 500 });
      }
    }

    // === DONNÉES COMPLÈTES (toutes les données en une fois) ===
    if (type === 'complete') {
      try {
        // Statistiques générales
        const [productsCount, customersCount, salesCount, salesTotalData] = await Promise.all([
          prisma.product.count({ where: { companyId } }),
          prisma.customer.count({ where: { companyId } }),
          prisma.sale.count({ where: { companyId } }),
          prisma.sale.aggregate({
            where: { companyId },
            _sum: { total: true },
          })
        ]);

        // Ventes du jour
        const todaySales = await prisma.sale.aggregate({
          where: {
            companyId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          _sum: { total: true },
          _count: true
        });

        // Ventes de la semaine
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekSales = await prisma.sale.aggregate({
          where: {
            companyId,
            createdAt: { gte: weekStart }
          },
          _sum: { total: true },
          _count: true
        });

        // Top 5 des produits les plus vendus
        const topProducts = await prisma.saleItem.groupBy({
          by: ['productId'],
          where: {
            sale: { companyId }
          },
          _sum: {
            quantity: true,
            total: true
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: 5
        });

        // Récupérer les détails des produits top ventes
        const productIds = topProducts.map(item => item.productId);
        const productDetails = await prisma.product.findMany({
          where: {
            id: { in: productIds }
          },
          select: {
            id: true,
            name: true,
            price: true
          }
        });

        const topProductsWithDetails = topProducts.map(item => {
          const product = productDetails.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            name: product?.name || 'Produit inconnu',
            price: product?.price || 0,
            totalQuantity: item._sum.quantity || 0,
            totalRevenue: item._sum.total || 0
          };
        });

        // Alertes stock critique
        const stockAlerts = await prisma.product.count({
          where: {
            companyId,
            isActive: true,
            quantity: {
              lte: prisma.product.fields.stockMin
            }
          }
        });

        return NextResponse.json({
          // Statistiques générales
          stats: {
            productsCount,
            customersCount,
            salesCount,
            salesTotal: salesTotalData._sum.total || 0,
          },
          // Statistiques périodiques
          periodic: {
            today: {
              sales: todaySales._count || 0,
              revenue: todaySales._sum.total || 0
            },
            week: {
              sales: weekSales._count || 0,
              revenue: weekSales._sum.total || 0
            }
          },
          // Top produits
          topProducts: topProductsWithDetails,
          // Alertes
          alerts: {
            stockAlerts
          }
        });
      } catch (dbError) {
        console.error('Erreur base de données (complete):', dbError);
        return NextResponse.json({ 
          message: 'Erreur lors du chargement des données complètes',
          code: 'DB_ERROR' 
        }, { status: 500 });
      }
    }

    // Type non reconnu
    return NextResponse.json({ 
      message: 'Type de données non reconnu',
      code: 'INVALID_TYPE',
      availableTypes: ['stats', 'sales-chart', 'stock-alerts', 'complete']
    }, { status: 400 });

  } catch (error: unknown) {
    console.error('Erreur dashboard API:', error);
    
    // Gestion spécifique des erreurs JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ 
        message: 'Token invalide',
        code: 'INVALID_TOKEN'
      }, { status: 401 });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ 
        message: 'Token expiré',
        code: 'TOKEN_EXPIRED'
      }, { status: 401 });
    }

    // Extraire le message d'erreur de manière sécurisée
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

    return NextResponse.json({ 
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}