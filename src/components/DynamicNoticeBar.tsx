"use client";

import React, { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DynamicIcon = ({ name, className }: { name?: string, className?: string }) => {
  if (!name) return null;
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};

export default function DynamicNoticeBar({ 
  showNoticeBar, 
  noticeBarFixed, 
  noticesList, 
  noticeBarText, 
  noticeBarIcon, 
  noticeBarExpiresAt, 
  noticeBarLinkText, 
  noticeBarLinkUrl 
}: {
  showNoticeBar: boolean;
  noticeBarFixed: boolean;
  noticesList: any[];
  noticeBarText: string;
  noticeBarIcon: string;
  noticeBarExpiresAt: string;
  noticeBarLinkText: string;
  noticeBarLinkUrl: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [activeNotices, setActiveNotices] = useState<any[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && showNoticeBar) {
      const now = new Date();
      let list: any[] = [];
      
      if (noticesList && noticesList.length > 0) {
        list = noticesList.filter((notice: any) => {
          if (!notice.text) return false;
          if (!notice.expiresAt) return true;
          return new Date(notice.expiresAt) > now;
        });
      } else if (noticeBarText) {
        const isNoticeExpired = noticeBarExpiresAt && new Date(noticeBarExpiresAt) < now;
        if (!isNoticeExpired) {
          list = [{
            id: 'legacy',
            text: noticeBarText,
            icon: noticeBarIcon || 'Megaphone',
            linkText: noticeBarLinkText,
            linkUrl: noticeBarLinkUrl
          }];
        }
      }
      
      setActiveNotices(list);
      setCurrentNoticeIndex(0);
    } else {
      setActiveNotices([]);
    }
  }, [mounted, showNoticeBar, noticesList, noticeBarText, noticeBarExpiresAt, noticeBarIcon, noticeBarLinkText, noticeBarLinkUrl]);

  useEffect(() => {
    if (activeNotices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentNoticeIndex((prevIndex) => (prevIndex + 1) % activeNotices.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeNotices]);

  if (!mounted || activeNotices.length === 0) return null;

  return (
    <div className={cn(
      "bg-secondary text-secondary-foreground py-2.5 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest z-[60]",
      noticeBarFixed && "sticky top-0 shadow-lg"
    )}>
      <div 
        key={activeNotices[currentNoticeIndex]?.id || currentNoticeIndex}
        className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 animate-in fade-in duration-500"
      >
        <div className="flex items-center gap-2">
          <DynamicIcon name={activeNotices[currentNoticeIndex]?.icon || 'Megaphone'} className="h-3 w-3 md:h-4 md:w-4" />
          <span>{activeNotices[currentNoticeIndex]?.text}</span>
        </div>
        {activeNotices[currentNoticeIndex]?.linkText && activeNotices[currentNoticeIndex]?.linkUrl && (
          <a 
            href={activeNotices[currentNoticeIndex]?.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-foreground/10 hover:bg-secondary-foreground/20 transition-colors border border-secondary-foreground/20 text-[9px] md:text-[11px]"
          >
            {activeNotices[currentNoticeIndex]?.linkText}
            <ArrowRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
