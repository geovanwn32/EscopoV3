import { Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TermosPage() {
    return (
        <div className="bg-muted/40 py-12">
            <div className="container mx-auto max-w-4xl px-4">
                 <div className="mb-8 text-center">
                    <Link href="/landing" className="inline-flex items-center gap-2 mb-4">
                        <Building2 className="h-7 w-7 text-primary" />
                        <span className="font-bold text-2xl">EscopoV3</span>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight font-headline">Termos de Serviço</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Última atualização: 05 de dezembro de 2025</p>
                </div>

                <Card className="shadow-lg">
                    <CardContent className="p-8 md:p-10 space-y-6 text-foreground/90 leading-relaxed">
                        <p className="text-muted-foreground">
                            Bem-vindo ao EscopoV3. Estes Termos de Serviço ("Termos") governam seu acesso e uso de nossos serviços de software como serviço (SaaS), incluindo nosso site, aplicativos e funcionalidades de inteligência artificial ("Serviço"). Ao acessar ou usar nosso Serviço, você concorda em ficar vinculado por estes Termos.
                        </p>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">1. Descrição do Serviço</h2>
                            <p>
                                O EscopoV3 é uma plataforma de gestão contábil, fiscal e financeira que oferece ferramentas para otimizar a rotina de empresas e escritórios de contabilidade. Nossos recursos incluem, mas não se limitam a: gestão fiscal, departamento pessoal, contabilidade, financeiro, cadastros, e utilitários com funcionalidades aprimoradas por Inteligência Artificial (IA), como o Gerador de Descrição de Transação e o Sugestor de Contas para Extratos Bancários.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">2. Contas de Usuário e Responsabilidades</h2>
                            <p>
                                <strong>2.1. Cadastro:</strong> Para acessar a maioria dos recursos, você deve criar uma conta, fornecendo informações precisas e completas. A criação de conta pode estar sujeita à aprovação de um administrador.
                            </p>
                            <p>
                                <strong>2.2. Segurança da Conta:</strong> Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta. Você concorda em nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.
                            </p>
                             <p>
                                <strong>2.3. Conduta do Usuário:</strong> Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida. Você é inteiramente responsável por todo o conteúdo que você carrega, publica ou transmite através do Serviço.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">3. Uso de Inteligência Artificial</h2>
                             <p>
                                <strong>3.1. Ferramentas de IA:</strong> Nossos Serviços podem incluir recursos que utilizam inteligência artificial para fornecer sugestões, como descrições de transações e categorização de contas.
                            </p>
                            <p>
                                <strong>3.2. Precisão e Verificação:</strong> As sugestões fornecidas por nossas ferramentas de IA são baseadas em padrões e dados históricos. Elas são oferecidas para auxiliar no seu trabalho, mas não são infalíveis. <strong>É sua responsabilidade exclusiva revisar, verificar e confirmar a precisão de todas as sugestões de IA antes de finalizar qualquer lançamento contábil, fiscal ou financeiro.</strong> O EscopoV3 não se responsabiliza por imprecisões, erros ou omissões resultantes do uso dessas ferramentas.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">4. Planos, Assinaturas e Pagamentos</h2>
                            <p>
                                O Serviço é oferecido sob diferentes planos de assinatura (ex: Gratuito, Básico, Profissional, Empresarial). Cada plano possui características, limites e preços distintos. Ao assinar um plano pago, você concorda em pagar as taxas aplicáveis. As taxas são não reembolsáveis, exceto conforme exigido por lei.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">5. Propriedade Intelectual e Dados do Cliente</h2>
                             <p>
                                <strong>5.1. Nosso Serviço:</strong> Todos os direitos, títulos e interesses no Serviço (excluindo os Dados do Cliente) são e permanecerão propriedade exclusiva do EscopoV3.
                            </p>
                            <p>
                                <strong>5.2. Seus Dados:</strong> Você retém todos os direitos de propriedade sobre seus dados e informações que você insere no sistema ("Dados do Cliente"). Você nos concede uma licença limitada para usar, processar e exibir seus Dados do Cliente exclusivamente na medida necessária para fornecer e aprimorar o Serviço.
                            </p>
                        </div>

                         <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">6. Limitação de Responsabilidade</h2>
                            <p>
                                O Serviço é fornecido "como está". Na máxima extensão permitida pela lei, o EscopoV3 se isenta de todas as garantias, expressas ou implícitas. Em nenhuma circunstância o EscopoV3 será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou outras perdas intangíveis.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">7. Alterações nos Termos</h2>
                            <p>
                                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Se fizermos alterações, forneceremos um aviso através do Serviço ou por outros meios. Seu uso continuado do Serviço após a data de vigência de tais alterações constituirá sua aceitação dos novos Termos.
                            </p>
                        </div>

                         <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-primary">8. Contato</h2>
                            <p>
                                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do e-mail: <a href="mailto:geovanisilvadeoliveira447@gmail.com" className="text-primary hover:underline">geovanisilvadeoliveira447@gmail.com</a>.
                            </p>
                        </div>

                    </CardContent>
                     <CardFooter className="p-8 md:p-10 border-t justify-center">
                        <Button asChild variant="outline">
                            <Link href="/landing">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
