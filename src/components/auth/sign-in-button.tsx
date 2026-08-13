'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import { GoogleIcon } from '@/components/icons/google-icon';
import { GitHubIcon } from '@/components/icons/github-icon';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signInWithProvider } from '@/lib/auth-actions';

const providers = [
	{ id: 'google' as const, name: 'Google', Icon: GoogleIcon },
	{ id: 'github' as const, name: 'GitHub', Icon: GitHubIcon }
];

type SignInButtonProps = VariantProps<typeof buttonVariants> & {
	className?: string;
	children: ReactNode;
};

export function SignInButton({ children, ...buttonProps }: SignInButtonProps) {
	const pathname = usePathname();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button {...buttonProps}>{children}</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center">
				{providers.map(({ id, name, Icon }) => (
					<DropdownMenuItem key={id} onClick={() => signInWithProvider(id, pathname)}>
						<Icon className="size-4.5" />
						Continuar con {name}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
