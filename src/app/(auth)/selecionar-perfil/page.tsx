
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, KeyRound, Loader2, ArrowLeft, PlusCircle, Trash2, LogOut } from 'lucide-react';
import { useCompany, useLocalStorage } from '@/hooks/use-company';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth, useUser } from '@/firebase';

interface UserProfile {
    id: number;
    uid: string;
    name: string;
    email: string;
    isAdmin: boolean;
    isMaster?: boolean;
    password?: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
    photoURL?: string;
}

export default function SelecionarPerfilPage() {
    const router = useRouter();
    const auth = useAuth();
    const { user: firebaseUser } = useUser();
    const [users, setUsers] = useLocalStorage<UserProfile[]>('global-users', []);
    const { toast } = useToast();

    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

    const availableProfiles = useMemo(() => {
        if (!firebaseUser) return [];
        return users.filter(u => u.email === firebaseUser.email && u.status !== 'Pendente');
    }, [users, firebaseUser]);


    const handleProfileSelect = (user: UserProfile) => {
        if (user.status === 'Inativo') {
            toast({
                variant: 'destructive',
                title: 'Acesso Negado',
                description: 'Este perfil de usuário está inativo. Contate um administrador.'
            });
            return;
        }
        if (user.password) {
            setSelectedUser(user);
        } else {
            sessionStorage.setItem('user-profile', JSON.stringify(user));
            router.push('/selecionar-empresa');
        }
    };

    const handlePasswordSubmit = () => {
        setIsLoading(true);

        setTimeout(() => {
            if (password === selectedUser?.password) {
                if (selectedUser) {
                    sessionStorage.setItem('user-profile', JSON.stringify(selectedUser));
                    toast({ title: "Acesso Autorizado!", description: `Bem-vindo(a) ${selectedUser.name}.` });
                    router.push('/selecionar-empresa');
                } else {
                    toast({ variant: 'destructive', title: "Erro de Perfil", description: "Não foi possível encontrar os dados do seu perfil." });
                    setIsLoading(false);
                }
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
    
    const handleSaveNewUser = (userData: Omit<UserProfile, 'id' | 'isAdmin' | 'isMaster' | 'permissions' | 'status' | 'uid'>) => {
        if (!firebaseUser) {
            toast({ variant: 'destructive', title: "Erro", description: "Você precisa estar autenticado para criar um perfil." });
            return;
        }
        
        const isFirstUser = users.length === 0;
        const newUser: UserProfile = {
            id: Date.now(),
            uid: firebaseUser.uid,
            ...userData,
            isAdmin: isFirstUser,
            isMaster: isFirstUser,
            status: 'Ativo',
        };
        setUsers(prev => [...prev, newUser]);
        setIsAddUserOpen(false);
        toast({ title: "Perfil Adicionado", description: "O novo perfil foi criado. Agora você pode fazer login com ele." });
    };

    const handleDeleteClick = (user: UserProfile) => {
        if (user.isMaster) {
             toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o perfil Master.',
            });
            return;
        }
        const adminUsers = users.filter(u => u.isAdmin && !u.isMaster);
        const masterExists = users.some(u => u.isMaster);

        if (user.isAdmin && masterExists && adminUsers.length <= 1) {
            toast({
                variant: 'destructive',
                title: 'Ação não permitida',
                description: 'Não é possível excluir o único perfil de administrador quando um Master existe.',
            });
            return;
        }
        setUserToDelete(user);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
            toast({
                variant: 'destructive',
                title: 'Perfil Excluído',
                description: `O perfil de ${userToDelete.name} foi removido.`,
            });
            setUserToDelete(null);
        }
    };
    
    const handleLogout = async () => {
        await auth.signOut();
        sessionStorage.clear();
        router.push('/login');
    };
    
    useEffect(() => {
    }, [router]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 animated-gradient">
            <div className="relative w-full max-w-4xl">
                 <Button variant="ghost" onClick={handleLogout} className="absolute -top-14 left-0 z-10 text-card-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    LOGOFF
                </Button>
                <div className="text-center mb-8 text-card-foreground">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Selecionar Perfil</h1>
                    <p className="text-muted-foreground">
                        Escolha o seu perfil de usuário para acessar o sistema.
                    </p>
                </div>
                
                {availableProfiles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center">
                    {availableProfiles.map((user) => (
                        <Card
                            key={user.id}
                            className="flex flex-col justify-between transition-shadow hover:shadow-lg focus-within:shadow-lg"
                        >
                             <CardContent 
                                className="flex flex-col flex-grow items-center justify-center p-6 text-center space-y-4 cursor-pointer"
                                onClick={() => handleProfileSelect(user)}
                            >
                                <Avatar className="h-20 w-20 border-2">
                                     <AvatarImage src={user.photoURL} alt={user.name} />
                                    <AvatarFallback className="bg-muted">
                                        {user.isMaster ? (
                                            <Shield className="h-10 w-10 text-amber-500" />
                                        ) : user.isAdmin ? (
                                            <Shield className="h-10 w-10 text-primary" />
                                        ) : (
                                            <User className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold">{user.name}</h2>
                                    <p className="text-sm text-muted-foreground">{user.isMaster ? "Master" : user.isAdmin ? "Administrador" : "Usuário"}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-2 border-t flex items-center gap-1">
                                <Button className="w-full" onClick={() => handleProfileSelect(user)}>
                                    <KeyRound className="mr-2 h-4 w-4" />
                                    Acessar
                                </Button>
                                {!user.isMaster && (
                                    <Button variant="ghost" size="icon" className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteClick(user)}>
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">Excluir</span>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                     <Card 
                        onClick={() => setIsAddUserOpen(true)}
                        className="cursor-pointer transition-transform hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary border-dashed bg-card/50 hover:bg-card flex flex-col items-center justify-center"
                        tabIndex={0}
                    >
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                            <PlusCircle className="h-10 w-10 mb-4"/>
                            <h2 className="text-lg font-semibold">Adicionar Perfil</h2>
                        </CardContent>
                    </Card>
                </div>
                ) : (
                     <Card className="w-full max-w-lg mx-auto text-center">
                        <CardHeader>
                            <CardTitle>Nenhum Perfil Cadastrado</CardTitle>
                            <CardDescription>
                                Você precisa criar seu primeiro perfil para este login.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={() => setIsAddUserOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Cadastrar Primeiro Perfil
                            </Button>
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
                isFirstUser={users.length === 0}
            />

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O perfil de <span className="font-bold">{userToDelete?.name}</span> será removido permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Omit<UserProfile, 'id' | 'isAdmin' | 'isMaster' | 'permissions' | 'status' | 'uid' | 'photoURL'>) => void;
    isFirstUser: boolean;
}

function AddUserDialog({ open, onOpenChange, onSave, isFirstUser }: AddUserDialogProps) {
    const { user: firebaseUser } = useUser();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if(firebaseUser?.displayName) {
            setName(firebaseUser.displayName);
        }
    }, [firebaseUser]);

    const handleSubmit = () => {
        if (!name || !password) {
            toast({ variant: 'destructive', title: "Campos obrigatórios", description: "Nome e senha são obrigatórios." });
            return;
        }
         if (!firebaseUser?.email) {
            toast({ variant: 'destructive', title: "Erro", description: "Email do usuário não encontrado." });
            return;
        }
        onSave({ name, email: firebaseUser.email, password });
        setName('');
        setPassword('');
    };

    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isFirstUser ? 'Criar Perfil de Administrador' : 'Adicionar Novo Perfil'}</DialogTitle>
                    <DialogDescription>
                        {isFirstUser ? 'Este será o perfil principal com acesso total ao sistema.' : 'Crie um novo perfil de usuário para acessar o sistema.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-name">Nome</Label>
                        <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input id="new-email" type="email" value={firebaseUser?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Senha de acesso ao perfil</Label>
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
