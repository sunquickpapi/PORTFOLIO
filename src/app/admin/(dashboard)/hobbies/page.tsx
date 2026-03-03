"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Heart } from "lucide-react";

interface Hobby {
    id: string;
    name: string;
    description: string;
    icon_name: string;
}

export default function HobbiesPage() {
    const [hobbies, setHobbies] = useState<Hobby[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHobbies();
    }, []);

    const fetchHobbies = async () => {
        try {
            const res = await fetch("/api/hobbies");
            const data = await res.json();
            setHobbies(data);
        } catch (error) {
            console.error("Error fetching hobbies:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteHobby = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const res = await fetch(`/api/hobbies/${id}`, { method: "DELETE" });
        if (res.ok) setHobbies(hobbies.filter((h) => h.id !== id));
    };

    if (loading) return <div className="p-8 text-indigo-600 font-medium">Loading your passions...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hobbies & Interests</h1>
                    <p className="text-sm text-gray-500">Manage what drives you outside of coding</p>
                </div>
                <Link
                    href="/admin/hobbies/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> Add Hobby
                </Link>
            </div>

            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    {hobbies.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <Heart size={48} className="mx-auto text-gray-200 mb-4 animate-pulse" />
                            <p className="text-gray-400 font-medium">No hobbies added yet. Share your interests!</p>
                        </div>
                    ) : (
                        hobbies.map((h) => (
                            <div key={h.id} className="p-6 hover:bg-gray-50 transition-colors group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                                        <Heart size={20} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/admin/hobbies/${h.id}`} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => deleteHobby(h.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{h.name}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{h.description}</p>
                                <div className="mt-4 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded inline-block">
                                    Icon: {h.icon_name || "Heart"}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
