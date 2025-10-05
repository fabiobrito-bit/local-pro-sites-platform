import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, Globe, Headphones, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Totaal Klanten',
      value: '48',
      icon: Users,
      change: '+4 deze maand',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Actieve Websites',
      value: '52',
      icon: Globe,
      change: '+6 deze maand',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Open Tickets',
      value: '12',
      icon: Headphones,
      change: '-3 vs vorige week',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Platform Groei',
      value: '+23%',
      icon: TrendingUp,
      change: 'MRR groei',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overzicht en statistieken</p>
      </div>

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
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recente Activiteit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin activiteit feed wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
