
'use client';
import Link from 'next/link';
import {
  CircleUser,
  Menu,
  Package2,
  PlusCircle,
  Home,
  Briefcase,
  LayoutDashboard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile) {
          setRole(profile.role as UserRole);
        }
      }
    };
    fetchUserAndRole();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6 text-primary" />
          <span className="sr-only">GastoControl</span>
        </Link>
        <Link
          href="/"
          className="text-foreground font-bold transition-colors hover:text-foreground"
        >
          GastoControl
        </Link>
        {role === 'admin' && (
           <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
        )}
        <Link href="/my-expenses" className="text-muted-foreground transition-colors hover:text-foreground">
          Mis Gastos
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6 text-primary" />
              <span className="sr-only">GastoControl</span>
            </Link>
            {role === 'admin' && (
              <Link href="/" className="hover:text-foreground flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
              </Link>
            )}
            <Link href="/my-expenses" className="text-muted-foreground hover:text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Mis Gastos
            </Link>
            <Link
              href="/add-expense"
              className="text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5"/>
              Añadir Gasto
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <Link href="/add-expense">
            <Button className="gap-1">
              <PlusCircle className="h-5 w-5" />
              <span className='hidden sm:inline'>Añadir Gasto</span>
            </Button>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email || 'Mi cuenta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ajustes</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
