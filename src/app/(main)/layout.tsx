import Header from "@/components/layout/Header/Header";
import NewFooter from "@/components/layout/Footer/NewFooter";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main>
                {children}
            </main>
            <NewFooter />
        </>
    );
}
