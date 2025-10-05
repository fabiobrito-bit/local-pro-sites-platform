import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export default function ClientFiles() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Bestandsbeheer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Mijn Bestanden</CardTitle>
          <CardDescription>Upload en beheer je bestanden</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Bestandsbeheer wordt binnenkort toegevoegd...</p>
        </CardContent>
      </Card>
    </div>
  );
}
