
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

function SocialIcon({ children, ...props }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    )
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v2.4h3.97c-.16 1.03-1.2 3.02-3.97 3.02-2.39 0-4.34-1.98-4.34-4.42s1.95-4.42 4.34-4.42c1.36 0 2.27.58 2.79 1.08l1.9-1.83C15.47 4.73 13.52 4 11.02 4 6.7 4 3.22 7.22 3.22 11.5s3.48 7.5 7.8 7.5c4.42 0 7.42-2.99 7.42-7.65 0-.5-.05-1-.12-1.48H12.48z"></path></svg>
    )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
    )
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M15.15 6.24c-.47.02-1.12.31-1.82.91-.74.63-1.34 1.7-1.5 2.83.02.01.03.02.05.02.1.02.21-.02.31-.02.48 0 1.02.21 1.59.62.63.45 1.04 1.13 1.19 1.88.02.13.04.26.04.39 0 .19-.04.4-.12.61-.19.55-.53.94-.96 1.23-.42.28-.88.45-1.4.52-.64.09-1.28-.15-1.88-.56-.6-.4-1.11-.99-1.52-1.71-.05-.1-.1-.18-.15-.26-.01 0-.01-.01-.01-.02-.05-.08-.1-.13-.15-.13-.05 0-.1.05-.15.13l-.01.02c-.05.08-.1.16-.15.26-.39.72-.9 1.31-1.52 1.71-.6.41-1.24.65-1.88.56-.52-.07-.98-.24-1.4-.52-.43-.29-.77-.68-.96-1.23-.08-.21-.12-.42-.12-.61 0-.13.01-.26.04-.39.15-.75.56-1.43 1.19-1.88.57-.41 1.11-.62 1.59-.62.1 0 .21.04.31.02.02 0 .03-.01.05-.02-.16-1.13-.76-2.2-1.5-2.83-.7-.6-1.35-.89-1.82-.91-.5-.02-1.16.22-1.74.68-.55.45-.96 1.08-1.22 1.78-.05.13-.1.26-.1.39s.01.26.04.39c.28.78.78 1.42 1.48 1.94.75.53 1.63.82 2.59.82.43 0 .85-.09 1.25-.26.4-.17.77-.42 1.12-.75.33.33.72.58 1.12.75.4.17.82.26 1.25.26.96 0 1.84-.29 2.59-.82.7-.52 1.2-1.16 1.48-1.94.03-.13.04-.26.04-.39s-.05-.26-.1-.39c-.26-.7-.67-1.33-1.22-1.78-.58-.46-1.24-.7-1.74-.68m.39-2.51c.04 0 .09.01.13.01.76-.02 1.47-.33 2.06-.93.56-.58.93-1.33.93-2.2 0-.1-.01-.2-.04-.29-.75.05-1.5.38-2.1.99-.58.6-.98 1.39-.98 2.33 0 .03.01.06.03.09z"></path></svg>
    )
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const characterImage = PlaceHolderImages.find(img => img.id === 'login-character');

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 lg:p-8 login-gradient">
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-6xl w-full mx-auto bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Panel */}
        <div className="relative hidden lg:flex flex-col justify-center items-center p-12 bg-primary/95 text-primary-foreground text-center">
            <div className="absolute inset-0 bg-primary opacity-20 transform -skew-y-6"></div>
            <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">Your Learning <br/> Journey Starts Here.</h2>
                <p className="text-primary-foreground/80 mb-8 max-w-sm">
                    Lorem ipsum is that it has a more-or-less normal distribution of letters, to using 'Content here, content here', making it look like readable English.
                </p>
                {characterImage && 
                    <Image 
                        src={characterImage.imageUrl}
                        alt={characterImage.description}
                        width={300}
                        height={400}
                        className="mx-auto"
                        data-ai-hint={characterImage.imageHint}
                    />
                }
            </div>
        </div>

        {/* Right Panel */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">TEACH TECH</h1>
                </div>

                <h2 className="text-3xl font-bold mb-2">{isSignUp ? "Welcome" : "Welcome Back"}</h2>
                <p className="text-muted-foreground mb-8">{isSignUp ? "Create an account" : "Log in to your account"}</p>

                <form className="space-y-4">
                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name:</Label>
                            <Input id="fullname" type="text" placeholder="" required className="bg-muted border-0" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email:</Label>
                        <Input id="email" type="email" placeholder="" required className="bg-muted border-0" />
                    </div>
                    <div className="space-y-2 relative">
                        <Label htmlFor="password">Password:</Label>
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="" required className="bg-muted border-0 pr-10" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 bottom-2.5 text-muted-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="flex items-center text-sm pt-2">
                        <Checkbox id="offers" />
                        <Label htmlFor="offers" className="ml-2 font-normal text-muted-foreground">Send me special offers, personalized recommendations, and learning tips.</Label>
                    </div>
                    
                    <Button type="submit" className="w-full font-semibold text-lg py-6 mt-6">
                        <Link href="/selecionar-empresa">{isSignUp ? 'Continue' : 'Log In'}</Link>
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">Other log in options</span></div>
                </div>

                <div className="flex justify-center gap-4">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-lg"><GoogleIcon className="h-5 w-5"/></Button>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-lg"><FacebookIcon className="h-5 w-5"/></Button>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-lg"><AppleIcon className="h-5 w-5"/></Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-8">
                    {isSignUp ? 'Have an account?' : "Don't have an account?"}{' '}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
                
                <div className="text-center mt-4">
                     <Link href="#" className="text-sm font-medium text-primary hover:underline">
                        Log In With Your Organization
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
