import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Activity, Globe, Users, TrendingUp } from 'lucide-react';

export default function ClientDashboard() {
  const stats = [
    {
      title: 'Website Status',
      value: 'Actief',
      icon: Globe,
      description: 'Online en bereikbaar',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Maandelijkse Bezoekers',
      value: '2,847',
      icon: Users,
      description: '+12% vs vorige maand',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Paginaweergaven',
      value: '12,456',
      icon: TrendingUp,
      description: '+8% vs vorige maand',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Recente Activiteit',
      value: '23',
      icon: Activity,
      description: 'Laatste 7 dagen',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentActivities = [
    { action: 'Content bijgewerkt', section: 'Homepage Hero', time: '2 uur geleden' },
    { action: 'Afbeelding geüpload', section: 'Gallerij', time: '5 uur geleden' },
    { action: 'Openingstijden gewijzigd', section: 'Contact', time: '1 dag geleden' },
    { action: 'Analytics rapport gegenereerd', section: 'Dashboard', time: '2 dagen geleden' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welkom terug! Hier is een overzicht van je website.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
          <CardDescription>Meest gebruikte functionaliteiten</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <h3 className="font-semibold mb-1">Content Bewerken</h3>
            <p className="text-sm text-muted-foreground">Wijzig website content</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <h3 className="font-semibold mb-1">Bekijk Analytics</h3>
            <p className="text-sm text-muted-foreground">Zie bezoekersstatistieken</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <h3 className="font-semibold mb-1">Chat Support</h3>
            <p className="text-sm text-muted-foreground">Stel een vraag</p>
          </button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recente Activiteit</CardTitle>
          <CardDescription>Je laatste wijzigingen en acties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.section}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
