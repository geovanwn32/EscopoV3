
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-company';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, PlusCircle, Upload, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function GerenciadorDeMidiaPage() {
    const { toast } = useToast();
    const [images, setImages] = useLocalStorage<ImagePlaceholder[]>('placeholderImages', PlaceHolderImages);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingImage, setEditingImage] = useState<ImagePlaceholder | null>(null);
    const [imageToDelete, setImageToDelete] = useState<ImagePlaceholder | null>(null);

    const filteredImages = useMemo(() => {
        if (!images) return [];
        return images.filter(img => 
            img.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            img.imageHint.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [images, searchTerm]);

    const handleSave = (imageData: ImagePlaceholder) => {
        const isNew = !images.some(img => img.id === imageData.id);
        if (isNew) {
            setImages(prev => [...prev, imageData]);
            toast({ title: 'Imagem Adicionada!', description: 'A nova imagem foi salva com sucesso.' });
        } else {
            setImages(prev => prev.map(img => img.id === imageData.id ? imageData : img));
            toast({ title: 'Imagem Atualizada!', description: 'Os dados da imagem foram atualizados.' });
        }
        setEditingImage(null);
    };

    const handleDelete = () => {
        if (imageToDelete) {
            setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
            toast({ variant: 'destructive', title: 'Imagem Excluída!', description: `A imagem "${imageToDelete.id}" foi removida.` });
            setImageToDelete(null);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gerenciador de Mídia</h1>
                <p className="text-muted-foreground">
                    Faça upload, edite e gerencie as imagens utilizadas no sistema e no site.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Galeria de Imagens</CardTitle>
                            <CardDescription>{images?.length || 0} imagens cadastradas.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por ID, descrição..." className="pl-9 w-full sm:w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Button onClick={() => setEditingImage({ id: '', description: '', imageUrl: '', imageHint: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Nova Imagem
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredImages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredImages.map(img => (
                                <Card key={img.id} className="overflow-hidden group">
                                    <div className="relative aspect-video">
                                        <Image src={img.imageUrl} alt={img.description} fill className="object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-sm truncate">{img.id}</CardTitle>
                                        <CardDescription className="text-xs truncate">{img.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0 flex gap-2">
                                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingImage(img)}>
                                            <Pencil className="mr-2 h-3 w-3" /> Editar
                                        </Button>
                                         <Button size="sm" variant="destructive" className="flex-1" onClick={() => setImageToDelete(img)}>
                                            <Trash2 className="mr-2 h-3 w-3" /> Excluir
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">Nenhuma imagem encontrada.</p>
                        </div>
                    )}
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

    useEffect(() => {
        setFormData(image);
    }, [image]);

    if (!formData) return null;

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

    const isFixedId = useMemo(() => {
        if (!image || !image.id) return false;
        return PlaceHolderImages.some(fixedImage => fixedImage.id === image.id);
    }, [image]);

    return (
        <Dialog open={!!image} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{image?.id ? 'Editar Imagem' : 'Adicionar Nova Imagem'}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da imagem. O ID é usado para referenciar a imagem no código.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">ID da Imagem (único)</Label>
                        <Input id="id" value={formData.id} onChange={e => handleInputChange('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))} required disabled={isFixedId} />
                         {isFixedId && <p className="text-xs text-muted-foreground">O ID de imagens padrão não pode ser alterado.</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição (alt text)</Label>
                        <Input id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="imageHint">Dica de IA (palavras-chave)</Label>
                        <Input id="imageHint" value={formData.imageHint} onChange={e => handleInputChange('imageHint', e.target.value)} placeholder="Ex: escritorio moderno" />
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
                            <Button asChild variant="outline">
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

    