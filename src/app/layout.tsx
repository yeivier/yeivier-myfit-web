import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
});

export const metadata: Metadata = {
	title: 'MyFit — Entrenamiento con progresión automática',
	description:
		'Registra tus entrenamientos, planifica mesociclos y deja que MyFit calcule tu progresión automáticamente. Gratis y simple.'
};

export const viewport: Viewport = {
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#fbfbf9' },
		{ media: '(prefers-color-scheme: dark)', color: '#1b1e26' }
	]
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
			<body className="flex h-full min-h-screen flex-col antialiased">
				<ThemeProvider>
					{children}
					<Toaster richColors position="top-center" />
				</ThemeProvider>
			</body>
		</html>
	);
}
