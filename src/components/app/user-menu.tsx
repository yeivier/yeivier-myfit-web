'use client';

import { LogOut, Settings, User, Users } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/lib/auth-actions';

type UserMenuProps = {
	name: string | null | undefined;
	email: string | null | undefined;
	image: string | null | undefined;
	role?: 'COACH' | 'ATHLETE';
};

function getInitials(name?: string | null) {
	if (!name) return '?';
	return name
		.split(' ')
		.slice(0, 2)
		.map((part) => part[0])
		.join('')
		.toUpperCase();
}

export function UserMenu({ name, email, image, role }: UserMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
				<Avatar>
					{image && <AvatarImage src={image} alt={name ?? 'Perfil'} referrerPolicy="no-referrer" />}
					<AvatarFallback>{getInitials(name)}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
					<span className="truncate text-sm font-medium text-foreground">{name}</span>
					<span className="truncate text-xs text-muted-foreground">{email}</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{role === 'COACH' && (
					<DropdownMenuItem asChild>
						<Link href="/coach">
							<Users className="size-4" />
							Mis alumnos
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem asChild>
					<Link href="/perfil">
						<User className="size-4" />
						Perfil
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/ajustes">
						<Settings className="size-4" />
						Configuración
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
					<LogOut className="size-4" />
					Cerrar sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
