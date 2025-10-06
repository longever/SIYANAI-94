// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, User, LogOut, Settings } from 'lucide-react';

import { useAuth } from '@/lib/auth';
export function UserMenu() {
  const {
    user,
    logout
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (!user) {
    return null;
  }
  const getInitials = name => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  return <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden sm:block">{user.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-sm text-muted-foreground border-b">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs">{user.userId}</div>
            </div>
            
            <button onClick={() => {
          // 跳转到个人中心
          window.location.href = '/profile';
          setIsOpen(false);
        }} className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
              <User className="h-4 w-4" />
              <span>个人中心</span>
            </button>
            
            <button onClick={() => {
          // 跳转到设置
          window.location.href = '/settings';
          setIsOpen(false);
        }} className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
              <Settings className="h-4 w-4" />
              <span>设置</span>
            </button>
            
            <div className="border-t my-1"></div>
            
            <button onClick={() => {
          logout();
          setIsOpen(false);
        }} className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors">
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>}
    </div>;
}
export function LoginButton() {
  const {
    login
  } = useAuth();
  return <Button onClick={login} className="bg-primary text-primary-foreground hover:bg-primary/90">
      登录 / 注册
    </Button>;
}