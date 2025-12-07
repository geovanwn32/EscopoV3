
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-company';
import { PlaceHolderImages, type ImagePlaceholder as BaseImagePlaceholder } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, PlusCircle, Upload, Pencil, Trash2, CheckCircle, Image as ImageIcon, LayoutGrid, List, ArrowUpDown, ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export interface ImagePlaceholder extends BaseImagePlaceholder {
    category?: string;
}

export default function GerenciadorDeMidiaPage() {
    const { toast } = useToast();
    const [images, setImages] = useLocalStorage<ImagePlaceholder[]>('placeholderImages', PlaceHolderImages);
    const [loginBgId, setLoginBgId] = useLocalStorage<string>('loginBackgroundId', 'login-background-professional');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [editingImage, setEditingImage] = useState<ImagePlaceholder | null>(null);
    const [imageToDelete, setImageToDelete] = useState<ImagePlaceholder | null>(null);
    const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const categories = useMemo(() => {
        if (!images) return [];
        const allCategories = new Set(images.map(img => img.category).filter(Boolean));
        return ['all', ...Array.from(allCategories)];
    }, [images]);

    const filteredImages = useMemo(() => {
        if (!images) return [];
        return images.filter(img => {
            const searchMatch = img.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                img.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (img.imageHint && img.imageHint.toLowerCase().includes(searchTerm.toLowerCase()));
            const categoryMatch = categoryFilter === 'all' || img.category === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [images, searchTerm, categoryFilter]);

    const paginatedImages = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredImages.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredImages, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(filteredImages.length / rowsPerPage);

    const handleSave = (imageData: ImagePlaceholder) => {
        const isNew = !images.some(img => img.id === imageData.id);
        if (isNew) {
            setImages(prev => [...(prev || []), imageData]);
            toast({ title: 'Imagem Adicionada!', description: 'A nova imagem foi salva com sucesso.' });
        } else {
            setImages(prev => (prev || []).map(img => img.id === imageData.id ? imageData : img));
            toast({ title: 'Imagem Atualizada!', description: 'Os dados da imagem foram atualizados.' });
        }
        setEditingImage(null);
    };

    const handleDelete = () => {
        if (imageToDelete) {
            setImages(prev => (prev || []).filter(img => img.id !== imageToDelete.id));
            toast({ variant: 'destructive', title: 'Imagem Excluída!', description: `A imagem "${imageToDelete.id}" foi removida.` });
            setImageToDelete(null);
        }
    };
    
    const handleBulkDelete = () => {
        if (selectedImageIds.length === 0) return;
        setImages(prev => (prev || []).filter(img => !selectedImageIds.includes(img.id)));
        toast({ variant: 'destructive', title: 'Imagens Excluídas!', description: `${selectedImageIds.length} imagens foram removidas.` });
        setSelectedImageIds([]);
    }

    const handleApplyAsLoginBg = (imageId: string) => {
        setLoginBgId(imageId);
        toast({
            title: "Imagem de Fundo Aplicada!",
            description: `A imagem "${imageId}" foi definida como o fundo da página de login.`,
        })
    }

     const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedImageIds(paginatedImages.map(img => img.id));
        } else {
            setSelectedImageIds([]);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Gerenciador de Mídia</h1>
                    <p className="text-muted-foreground">
                        Faça upload, edite e gerencie as imagens utilizadas no sistema e no site.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Galeria de Imagens</CardTitle>
                            <CardDescription>{filteredImages.length} imagens encontradas.</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por ID, descrição..." className="pl-9 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Todas as Categorias' : cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className='flex gap-1 rounded-md border p-1'>
                                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className='h-4 w-4'/></Button>
                                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List className='h-4 w-4'/></Button>
                            </div>
                            <Button onClick={() => setEditingImage({ id: '', description: '', imageUrl: '', imageHint: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Nova Imagem
                            </Button>
                        </div>
                    </div>
                     {selectedImageIds.length > 0 && viewMode === 'list' && (
                        <div className="flex items-center gap-2 mt-4 border-t pt-4">
                            <span className="text-sm text-muted-foreground">{selectedImageIds.length} selecionado(s)</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline">Ações em Lote <ArrowUpDown className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Selecionadas
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {viewMode === 'grid' ? (
                        paginatedImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {paginatedImages.map(img => (
                                    <Card key={img.id} className="overflow-hidden group flex flex-col">
                                        <div className="relative aspect-video">
                                            <Image src={img.imageUrl} alt={img.description} fill className="object-cover transition-transform group-hover:scale-105" />
                                            {loginBgId === img.id && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary/80 px-2 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm">
                                                    <ImageIcon className="h-3 w-3" /> Fundo do Login
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-sm truncate">{img.id}</CardTitle>
                                            <CardDescription className="text-xs truncate">{img.description}</CardDescription>
                                        </CardHeader>
                                        <CardFooter className="p-3 pt-0 mt-auto flex flex-col gap-2">
                                            <Button 
                                                size="sm" 
                                                variant={loginBgId === img.id ? "default" : "secondary"} 
                                                className="w-full"
                                                onClick={() => handleApplyAsLoginBg(img.id)}
                                                disabled={loginBgId === img.id}
                                            >
                                                {loginBgId === img.id ? <CheckCircle className="mr-2 h-4 w-4" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                                                {loginBgId === img.id ? 'Aplicado' : 'Aplicar no Login'}
                                            </Button>
                                            <div className="flex w-full gap-2">
                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingImage(img)}>
                                                    <Pencil className="mr-2 h-3 w-3" /> Editar
                                                </Button>
                                                <Button size="sm" variant="destructive" className="flex-1" onClick={() => setImageToDelete(img)}>
                                                    <Trash2 className="mr-2 h-3 w-3" /> Excluir
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground">Nenhuma imagem encontrada.</p>
                            </div>
                        )
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox onCheckedChange={toggleSelectAll} checked={selectedImageIds.length === paginatedImages.length && paginatedImages.length > 0} />
                                        </TableHead>
                                        <TableHead>Preview</TableHead>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead className="w-[100px] text-center">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedImages.length > 0 ? paginatedImages.map(img => (
                                        <TableRow key={img.id}>
                                            <TableCell>
                                                <Checkbox checked={selectedImageIds.includes(img.id)} onCheckedChange={(checked) => setSelectedImageIds(prev => checked ? [...prev, img.id] : prev.filter(id => id !== img.id))} />
                                            </TableCell>
                                            <TableCell>
                                                <Image src={img.imageUrl} alt={img.description} width={80} height={45} className="object-cover rounded-md aspect-video" />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{img.id}</TableCell>
                                            <TableCell>{img.description}</TableCell>
                                            <TableCell>{img.category || 'N/A'}</TableCell>
                                            <TableCell className="text-center">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingImage(img)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                         <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Nenhuma imagem encontrada com os filtros atuais.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                     <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                           {viewMode === 'list' && `${selectedImageIds.length} de `} {filteredImages.length} linha(s) {viewMode === 'grid' && 'encontradas'}.
                        </div>
                        <div className="flex items-center space-x-6 lg:space-x-8">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium">Linhas por página</p>
                                <Select
                                    value={`${rowsPerPage}`}
                                    onValueChange={(value) => {
                                    setRowsPerPage(Number(value))
                                    setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={rowsPerPage} />
                                    </SelectTrigger>
                                    <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                Página {currentPage} de {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                                <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ImageEditDialog 
                image={editingImage} 
                onOpenChange={() => setEditingImage(null)}
                onSave={handleSave}
            />

            <AlertDialog open={!!imageToDelete} onOpenChange={() => setImageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A imagem será removida permanentemente.
                            Isso pode quebrar referências de imagem no site se o ID ainda estiver em uso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

interface ImageEditDialogProps {
    image: ImagePlaceholder | null;
    onOpenChange: () => void;
    onSave: (image: ImagePlaceholder) => void;
}

function ImageEditDialog({ image, onOpenChange, onSave }: ImageEditDialogProps) {
    const [formData, setFormData] = useState<ImagePlaceholder | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const isEditing = useMemo(() => !!image?.id, [image]);


    useEffect(() => {
        setFormData(image);
    }, [image]);
    
    if (!formData) return null;

    const handleIdChange = (id: string) => {
        handleInputChange('id', id.toLowerCase().replace(/\s+/g, '-'));
    };
    
    const handleInputChange = (field: keyof ImagePlaceholder, value: string) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                handleInputChange('imageUrl', base64String);
                setIsUploading(false);
                toast({ title: 'Upload Concluído', description: 'A imagem foi carregada. Salve para confirmar.' });
            };
            reader.onerror = () => {
                setIsUploading(false);
                toast({ variant: 'destructive', title: 'Erro no Upload', description: 'Não foi possível carregar a imagem.' });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id || !formData.imageUrl) {
            toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'ID e URL da Imagem são necessários.' });
            return;
        }
        onSave(formData);
    };

    return (
        <Dialog open={!!image} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Imagem' : 'Adicionar Nova Imagem'}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da imagem. O ID é usado para referenciar a imagem no código.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">ID da Imagem</Label>
                        <Input 
                            id="id" 
                            value={formData.id} 
                            onChange={e => handleIdChange(e.target.value)} 
                            required 
                            placeholder="id-unico-para-a-imagem"
                            disabled={isEditing}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Input id="category" value={formData.category || ''} onChange={e => handleInputChange('category', e.target.value)} placeholder="Ex: Logo, Background, Avatar" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (alt text)</Label>
                        <Input id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="imageHint">Dica de IA (palavras-chave)</Label>
                        <Input id="imageHint" value={formData.imageHint || ''} onChange={e => handleInputChange('imageHint', e.target.value)} placeholder="Ex: escritorio moderno" />
                    </div>
                    <div className="space-y-2">
                        <Label>Pré-visualização</Label>
                        <div className="w-full aspect-video rounded-md border bg-muted flex items-center justify-center">
                            {formData.imageUrl ? (
                                <Image src={formData.imageUrl} alt="Preview" width={300} height={169} className="rounded-md object-contain" />
                            ) : (
                                <span className="text-sm text-muted-foreground">Faça upload de uma imagem</span>
                            )}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="imageUrl">Origem da Imagem</Label>
                        <div className='flex gap-2'>
                            <Input id="imageUrl" value={formData.imageUrl} onChange={e => handleInputChange('imageUrl', e.target.value)} placeholder="http://... ou data:image/..."/>
                            <Button asChild variant="outline" type='button'>
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <Upload className="h-4 w-4" />
                                    <input id="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={isUploading}/>
                                </label>
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
