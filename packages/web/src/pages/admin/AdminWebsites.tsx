import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminWebsites() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Websitebeheer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Alle Websites</CardTitle>
          <CardDescription>Beheer websites en Replit integraties</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Websitebeheer wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
