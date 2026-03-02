import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BRAND_COLOR, SECONDARY_COLOR } from '../constants/constants';

const PrivacyPolicy: React.FC = () => {
    const lastUpdated = '2 de marzo de 2026';
    const companyName = 'Andrea Sartori Inmobiliaria';
    const contactEmail = 'andrea_sartori@hotmail.com';
    const contactPhone = '+54 3533 454096';
    const officeAddress = 'Las Varillas, Córdoba, Argentina';

    const sections = [
        {
            icon: 'info',
            title: '¿Quiénes somos?',
            content: `${companyName} es una empresa inmobiliaria con domicilio en ${officeAddress}. Este sitio web tiene como finalidad brindar información sobre propiedades en venta y alquiler, y facilitar el contacto entre potenciales clientes y nuestra empresa.`,
        },
        {
            icon: 'database',
            title: '¿Qué datos recopilamos?',
            content: null,
            list: [
                'Nombre y apellido (cuando completás el formulario de contacto)',
                'Dirección de correo electrónico',
                'Número de teléfono',
                'Mensaje o consulta que nos enviás',
            ],
            extra: 'No recopilamos datos sensibles como DNI, CUIL, datos bancarios ni historial crediticio a través de este sitio web.',
        },
        {
            icon: 'target',
            title: '¿Para qué usamos tus datos?',
            content: null,
            list: [
                'Responder a tu consulta sobre propiedades o servicios',
                'Contactarte para brindarte asesoramiento inmobiliario',
                'Enviarte información relevante que hayas solicitado',
            ],
            extra: 'Tus datos no serán utilizados para publicidad no solicitada ni compartidos con terceros sin tu consentimiento.',
        },
        {
            icon: 'share',
            title: '¿Compartimos tus datos?',
            content: 'No vendemos, alquilamos ni cedemos tus datos personales a terceros. Tus datos son tratados exclusivamente por el equipo de Andrea Sartori Inmobiliaria para responder a tus consultas.',
        },
        {
            icon: 'lock',
            title: '¿Cómo protegemos tus datos?',
            content: 'Este sitio utiliza conexión cifrada HTTPS con protocolo TLS 1.3 para proteger la transmisión de tu información. Los datos son almacenados en servidores seguros con acceso restringido.',
        },
        {
            icon: 'schedule',
            title: '¿Por cuánto tiempo conservamos tus datos?',
            content: 'Conservamos tus datos únicamente durante el tiempo necesario para responder tu consulta y, en caso de convertirse en cliente, durante la vigencia de la relación comercial más el período exigido por la normativa fiscal y contable argentina.',
        },
        {
            icon: 'verified_user',
            title: 'Tus derechos (Ley 25.326)',
            content: 'De conformidad con la Ley N° 25.326 de Protección de Datos Personales, tenés derecho a:',
            list: [
                'Acceder a tus datos personales que obren en nuestros registros',
                'Rectificar datos incorrectos o desactualizados',
                'Solicitar la supresión de tus datos cuando ya no sean necesarios',
                'Oponerte al tratamiento de tus datos',
            ],
            extra: `Para ejercer estos derechos, podés contactarnos en ${contactEmail}. La AAIP (Agencia de Acceso a la Información Pública) es el organismo de control: www.argentina.gob.ar/aaip`,
        },
        {
            icon: 'cookie',
            title: 'Cookies y almacenamiento local',
            content: 'Este sitio puede utilizar almacenamiento local del navegador (localStorage) para mantener tu sesión activa si accedés al área de administración. No utilizamos cookies de rastreo ni publicidad de terceros.',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <SEO
                title={`Política de Privacidad | ${companyName}`}
                description="Conocé cómo Andrea Sartori Inmobiliaria recopila, usa y protege tus datos personales conforme a la Ley 25.326 de Argentina."
                keywords="política de privacidad, datos personales, ley 25326, inmobiliaria, Andrea Sartori"
            />

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        to="/"
                        className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors mb-8 group"
                    >
                        <span className="material-symbols-outlined text-base mr-2 group-hover:-translate-x-1 transition-transform">
                            arrow_back
                        </span>
                        Volver al inicio
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#F2D5E5' }}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ color: BRAND_COLOR }}>
                                security
                            </span>
                        </div>
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.3em]"
                            style={{ color: BRAND_COLOR }}
                        >
                            Aviso legal
                        </span>
                    </div>

                    <h1
                        className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                        style={{ color: SECONDARY_COLOR }}
                    >
                        Política de Privacidad
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Última actualización: <span className="font-medium text-gray-500">{lastUpdated}</span>
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-6 shadow-sm">
                    <p className="text-gray-600 leading-relaxed">
                        En <strong>{companyName}</strong> valoramos y respetamos tu privacidad. Esta Política de
                        Privacidad describe cómo recopilamos, usamos y protegemos tus datos personales,
                        conforme a la{' '}
                        <strong>Ley N° 25.326 de Protección de Datos Personales</strong> de la República
                        Argentina.
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ backgroundColor: '#F2D5E5' }}
                                >
                                    <span
                                        className="material-symbols-outlined text-xl"
                                        style={{ color: BRAND_COLOR }}
                                    >
                                        {section.icon}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2
                                        className="text-base font-bold mb-3"
                                        style={{ color: SECONDARY_COLOR }}
                                    >
                                        {section.title}
                                    </h2>

                                    {section.content && (
                                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{section.content}</p>
                                    )}

                                    {section.list && (
                                        <ul className="space-y-2 mb-3">
                                            {section.list.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                    <span
                                                        className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5"
                                                        style={{ color: BRAND_COLOR }}
                                                    >
                                                        check_circle
                                                    </span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.extra && (
                                        <p className="text-gray-500 text-xs leading-relaxed bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                                            {section.extra}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Box */}
                <div
                    className="mt-6 rounded-3xl p-8 text-white"
                    style={{ background: `linear-gradient(135deg, ${BRAND_COLOR}, ${SECONDARY_COLOR})` }}
                >
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-3xl text-white/80 flex-shrink-0">
                            mail
                        </span>
                        <div>
                            <h3 className="font-bold text-lg mb-2">¿Tenés alguna pregunta?</h3>
                            <p className="text-white/80 text-sm mb-4">
                                Podés contactarnos para ejercer tus derechos o consultar sobre el tratamiento de
                                tus datos.
                            </p>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    <span className="text-white/60">Email: </span>
                                    <a href={`mailto:${contactEmail}`} className="hover:underline">
                                        {contactEmail}
                                    </a>
                                </p>
                                <p className="text-sm font-medium">
                                    <span className="text-white/60">Teléfono: </span>
                                    {contactPhone}
                                </p>
                                <p className="text-sm font-medium">
                                    <span className="text-white/60">Domicilio: </span>
                                    {officeAddress}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-300 text-[10px] uppercase tracking-widest mt-10 pb-4">
                    {companyName} · Todos los derechos reservados
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
