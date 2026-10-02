import Cargando from '@/components/admin/Cargando';
import AdminLayout from '@/components/layout/AdminLayout';
import { useConsulta } from '@/hooks/useConsulta';

/**
 * Pantalla del panel que pide sus datos a la API (GET) y se muestra cuando llegan.
 * Mientras tanto (o si falla) se ve el aviso de carga con "Reintentar".
 *
 * <PantallaApi url="/admin/dashboard" titulo="Dashboard">
 *     {({ datos, respuesta, recargar }) => <Contenido {...datos} recargar={recargar} />}
 * </PantallaApi>
 */
export default function PantallaApi({ url, params, titulo, children }) {
    const consulta = useConsulta(url, params);

    if (consulta.datos === undefined) {
        return (
            <AdminLayout title={titulo}>
                <Cargando error={consulta.error} onReintentar={consulta.recargar} />
            </AdminLayout>
        );
    }

    return children(consulta);
}
