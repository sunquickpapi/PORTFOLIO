import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import AdminThemeWrapper from "@/components/Admin/AdminThemeWrapper";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/admin/login");
    }

    return (
        <AdminThemeWrapper>
            <div className="flex min-h-screen transition-colors duration-400">
                <AdminSidebar />
                <main className="flex-1 p-10 transition-colors duration-400">
                    {children}
                </main>
            </div>
        </AdminThemeWrapper>
    );
}
