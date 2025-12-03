
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, KeyRound, Loader2, ArrowLeft, PlusCircle } from 'lucide-react';
import { useCompany } from '@/hooks/use-company';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    isAdmin: boolean;
    password?: string;
}

export default function SelecionarPerfilPage() {
    const router = useRouter();
    const { useScopedData, currentCompany } = useCompany();
    const [users, setUsers] = useScopedData<UserProfile[]>('global-users', []);
    const { toast } = useToast();

    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    const handleProfileSelect = (user: UserProfile) => {
        if (user.password) {
            setSelectedUser(user);
        } else {
            sessionStorage.setItem(`user-profile-${currentCompany}`, JSON.stringify(user));
            router.push('/dashboard');
        }
    };

    const handlePasswordSubmit = () => {
        setIsLoading(true);

        setTimeout(() => {
            if (password === selectedUser?.password) {
                toast({ title: "Acesso Autorizado!", description: `Bem-vindo(a) ${selectedUser.name}.` });
                sessionStorage.setItem(`user-profile-${currentCompany}`, JSON.stringify(selectedUser));
                router.push('/dashboard');
            } else {
                toast({ variant: 'destructive', title: "Senha Incorreta", description: "A senha que você inseriu está incorreta. Tente novamente." });
                setIsLoading(false);
                setPassword('');
            }
        }, 500);
    };

    const handleDialogClose = () => {
        setSelectedUser(null);
        setPassword('');
        setIsLoading(false);
    }
    
    const handleSaveNewUser = (userData: Omit<UserProfile, 'id' | 'isAdmin' | 'permissions'>) => {
        const newUser: UserProfile = {
            id: Date.now(),
            ...userData,
            isAdmin: false, // New users are not admins by default
            permissions: {},
        };
        setUsers(prev => [...prev, newUser]);
        setIsAddUserOpen(false);
        toast({ title: "Perfil Adicionado", description: "O novo perfil foi criado. Agora você pode fazer login com ele." });
    };
    
    useEffect(() => {
        if (!currentCompany) {
            router.push('/selecionar-empresa');
        }
    }, [currentCompany, router]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 animated-gradient">
            <div className="relative w-full max-w-4xl">
                 <Button asChild variant="ghost" className="absolute -top-14 left-0 z-10 text-card-foreground">
                    <Link href="/selecionar-empresa">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Trocar Empresa
                    </Link>
                </Button>
                <div className="text-center mb-8 text-card-foreground">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Selecionar Perfil</h1>
                    <p className="text-muted-foreground">
                        Escolha o seu perfil de usuário para acessar o sistema.
                    </p>
                </div>
                
                {users.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {users.map((user) => (
                        <Card
                            key={user.id}
                            className="flex flex-col justify-between transition-shadow hover:shadow-lg focus-within:shadow-lg"
                        >
                            <CardContent className="flex flex-col flex-grow items-center justify-center p-6 text-center space-y-4">
                                <Avatar className="h-20 w-20 border-2">
                                    <AvatarFallback className="bg-muted">
                                        {user.isAdmin ? (
                                            <Shield className="h-10 w-10 text-primary" />
                                        ) : (
                                            <User className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user.isAdmin ? "Administrador" : "Usuário"}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-2 border-t">
                                <Button className="w-full" onClick={() => handleProfileSelect(user)}>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Acessar
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    <Card
                        onClick={() => setIsAddUserOpen(true)}
                        className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg border-dashed bg-card/50 hover:bg-card flex items-center justify-center"
                    >
                        <CardContent className="p-6 text-center text-muted-foreground">
                             <PlusCircle className="h-10 w-10 mx-auto mb-4"/>
                            <h2 className="text-lg font-semibold">Adicionar Perfil</h2>
                        </CardContent>
                    </Card>
                </div>
                ) : (
                     <Card className="w-full max-w-lg mx-auto text-center">
                        <CardHeader>
                            <CardTitle>Nenhum Perfil Encontrado</CardTitle>
                            <CardDescription>
                                Nenhum perfil de usuário foi cadastrado para esta empresa. Contate um administrador para criar seu acesso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Se você é o administrador, pode cadastrar usuários em <Link href="/cadastros/usuarios" className='font-semibold text-primary hover:underline'>Cadastros &gt; Usuários e Perfis</Link> após o primeiro acesso.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && handleDialogClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                            <KeyRound className='h-5 w-5 text-primary' />
                            Autenticação de Perfil
                        </DialogTitle>
                        <DialogDescription>
                            Digite a senha para o perfil de <span className='font-bold'>{selectedUser?.name}</span> para continuar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="profile-password">Senha de Acesso</Label>
                        <Input
                            id="profile-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogClose}>Cancelar</Button>
                        <Button onClick={handlePasswordSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <AddUserDialog 
                open={isAddUserOpen} 
                onOpenChange={setIsAddUserOpen}
                onSave={handleSaveNewUser}
            />
        </div>
    );
}


interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Omit<UserProfile, 'id' | 'isAdmin' | 'permissions'>) => void;
}

function AddUserDialog({ open, onOpenChange, onSave }: AddUserDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name || !email || !password) {
            toast({ variant: 'destructive', title: "Campos obrigatórios", description: "Nome, email e senha são obrigatórios." });
            return;
        }
        onSave({ name, email, password });
    };

    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Perfil</DialogTitle>
                    <DialogDescription>Crie um novo perfil de usuário para acessar o sistema.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-name">Nome</Label>
                        <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Senha</Label>
                        <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
