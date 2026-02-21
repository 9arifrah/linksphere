'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { format, subDays, isSameDay, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

interface GrowthChartProps {
    links: any[]
    users: any[]
}

export function GrowthChart({ links, users }: GrowthChartProps) {
    const data = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(new Date(), 6 - i)
            return {
                date,
                dateStr: format(date, 'd MMM', { locale: id }),
                links: 0,
                users: 0,
            }
        })

        links.forEach((link) => {
            const linkDate = parseISO(link.created_at)
            const dayData = last7Days.find((d) => isSameDay(d.date, linkDate))
            if (dayData) {
                dayData.links += 1
            }
        })

        users.forEach((user) => {
            const userDate = parseISO(user.created_at)
            const dayData = last7Days.find((d) => isSameDay(d.date, userDate))
            if (dayData) {
                dayData.users += 1
            }
        })

        return last7Days
    }, [links, users])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">
                    Tren Pertumbuhan (7 Hari Terakhir)
                </CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[300px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorLinks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="dateStr"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="links"
                                name="Link Baru"
                                stroke="#2563eb"
                                fillOpacity={1}
                                fill="url(#colorLinks)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="users"
                                name="User Baru"
                                stroke="#16a34a"
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
