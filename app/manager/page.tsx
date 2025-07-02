import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagerDashboard() {
    return (
        <main className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Tableau de bord Manager</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Utilisateurs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">120</p>
                            <Button className="mt-4 w-full">Voir les utilisateurs</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Projets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">8</p>
                            <Button className="mt-4 w-full">Voir les projets</Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tâches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-semibold">34</p>
                            <Button className="mt-4 w-full">Voir les tâches</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
                    <ul className="space-y-2">
                        <li className="flex items-center justify-between">
                            <span>Nouvel utilisateur inscrit</span>
                            <span className="text-gray-500 text-sm">il y a 2 heures</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span>Projet "Alpha" mis à jour</span>
                            <span className="text-gray-500 text-sm">il y a 1 jour</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span>Tâche "Design UI" complétée</span>
                            <span className="text-gray-500 text-sm">il y a 3 jours</span>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}