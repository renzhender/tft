import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'弈览 · S18 强化评级',description:'以主播实战对局观察 S18 海克斯表现，查看彩、金、银强化评级、平均排名与样本来源。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN" className="dark"><body>{children}</body></html>;}
