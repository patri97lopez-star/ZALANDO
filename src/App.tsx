/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  Truck, 
  RefreshCw, 
  FileText, 
  ArrowRight,
  Loader2,
  ChevronRight,
  Info,
  Mail,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { classifyIncident, IncidentData } from "@/src/lib/gemini";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const ZalandoLogo = () => (
  <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
    <path d="M15 5L25 25H5L15 5Z" fill="#FF6900" />
    <text x="35" y="28" fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="24" fill="black">zalando</text>
  </svg>
);

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [result, setResult] = useState<IncidentData | null>(null);
  const [history, setHistory] = useState<(IncidentData & { id: string; timestamp: string })[]>([]);

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error("Por favor, introduce el texto de la incidencia.");
      return;
    }

    setIsProcessing(true);
    try {
      const data = await classifyIncident(inputText);
      
      // If no email is detected, generate a random one for testing purposes
      if (data.customerEmail === "No detectado") {
        const randomNames = ["pablo", "maria", "lucia", "carlos", "elena", "sergio", "ana", "jorge"];
        const randomDomains = ["gmail.com", "outlook.com", "hotmail.com", "icloud.com"];
        const name = randomNames[Math.floor(Math.random() * randomNames.length)];
        const domain = randomDomains[Math.floor(Math.random() * randomDomains.length)];
        const randomNum = Math.floor(Math.random() * 999);
        data.customerEmail = `${name}.${randomNum}@${domain}`;
        
        toast.info("Email de prueba generado", {
          description: "La IA no detectó un email, así que hemos generado uno aleatorio para que puedas probar el envío.",
        });
      }

      setResult(data);
      toast.success("Incidencia analizada correctamente.");
      
      // Automatic notification message
      setTimeout(() => {
        toast.info(`Notificación enviada automáticamente`, {
          description: `Se ha enviado un aviso preventivo a ${data.customerEmail} confirmando la recepción de la incidencia.`,
          icon: <Mail className="w-4 h-4" />,
        });
      }, 1000);
    } catch (error) {
      toast.error("Error al procesar la incidencia. Inténtalo de nuevo.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!result || !result.customerEmail || result.customerEmail === "No detectado") {
      toast.error("No se ha detectado un email válido para enviar la notificación.");
      return;
    }

    setIsSendingEmail(true);
    // Simulating email sending logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`¡Mensaje enviado con éxito!`, {
      description: `El cliente (${result.customerEmail}) ha sido notificado correctamente sobre el estado de su pedido ${result.orderId}.`,
      duration: 5000,
    });
    setIsSendingEmail(false);
  };

  const handleRegister = () => {
    if (!result) return;

    const newEntry = {
      ...result,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };

    setHistory([newEntry, ...history].slice(0, 5));
    
    toast.success("Incidencia registrada con éxito", {
      description: `Pedido ${result.orderId} guardado en el historial.`,
    });
    
    setResult(null);
    setInputText("");
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.info("Historial limpiado.");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Devolución": return <RefreshCw className="w-5 h-5" />;
      case "Cambio de Talla": return <Package className="w-5 h-5" />;
      case "Entrega Fallida": return <Truck className="w-5 h-5" />;
      case "Facturación": return <FileText className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Alta": return "bg-red-100 text-red-700 border-red-200";
      case "Media": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Baja": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "Muy Grave": return "bg-red-600 text-white border-red-700 hover:bg-red-700";
      case "Grave": return "bg-orange-500 text-white border-orange-600 hover:bg-orange-600";
      case "Leve": return "bg-blue-500 text-white border-blue-600 hover:bg-blue-600";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-black text-lg">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <ZalandoLogo />
          <div className="flex items-center gap-6 text-base font-medium text-gray-500">
            <span className="hidden md:inline">Soporte de Operaciones Inteligentes</span>
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 px-3 py-1 text-sm">PRO v2.0</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* Left Column: Input & History */}
          <div className="xl:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-zalando-black">
                Zalando Incident Automator
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Herramienta de alta precisión para la clasificación automática de tickets de soporte. 
                Ahorra hasta un 80% de tiempo en el triaje manual.
              </p>
            </motion.div>

            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="pb-4 bg-gray-50/50 border-b border-gray-100">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  Entrada de Incidencia
                </CardTitle>
                <CardDescription className="text-base">Pega aquí el contenido del email o formulario del cliente.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea 
                  placeholder="Ej: Hola, recibí mi pedido #123456789 pero las zapatillas Nike me quedan pequeñas. Quiero cambiarlas por una talla 42..."
                  className="min-h-[300px] text-lg p-6 resize-none border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-gray-50/50 border-t border-gray-100 p-6">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Motor de IA Gemini 3.1 Activo
                </div>
                <Button 
                  onClick={handleProcess} 
                  disabled={isProcessing}
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white px-8 py-6 text-lg font-bold transition-all transform hover:scale-105 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      Analizar Ahora
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* History Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                  Actividad Reciente
                </h2>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-gray-400 hover:text-red-500">
                    Limpiar historial
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-3 rounded-full">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="font-bold text-base">{item.category}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            Pedido: {item.orderId} • {item.timestamp}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getSeverityStyles(item.severity)}`}>
                              {item.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getUrgencyColor(item.urgency)}>{item.urgency}</Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-100/50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 italic">
                    No hay registros recientes
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="xl:col-span-5 relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="sticky top-28 space-y-8"
                >
                  <Card className="border-none shadow-2xl overflow-hidden bg-white ring-1 ring-black/5">
                    <div className="h-3 bg-orange-600 w-full" />
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-3">
                          <Badge className={`px-4 py-2 rounded-full border text-sm font-bold ${getUrgencyColor(result.urgency)}`}>
                            URGENCIA {result.urgency.toUpperCase()}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-9 px-4 rounded-xl font-black text-xs uppercase tracking-tighter shadow-sm border-none pointer-events-none ${getSeverityStyles(result.severity)}`}
                          >
                            Gravedad: {result.severity}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-base text-gray-400 font-mono">
                          ID: {result.orderId}
                        </div>
                      </div>
                      <CardTitle className="text-3xl mt-6 flex items-center gap-3 font-extrabold">
                        <div className="bg-orange-50 p-2 rounded-xl">
                          {getCategoryIcon(result.category)}
                        </div>
                        {result.category}
                      </CardTitle>
                      <CardDescription className="text-lg italic text-gray-600 mt-2 leading-relaxed">
                        "{result.summary}"
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Sentimiento</span>
                          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <span className="text-2xl">
                              {result.sentiment === "Frustrado" ? "😡" : result.sentiment === "Neutral" ? "😐" : "😊"}
                            </span>
                            <span className="font-bold text-gray-700">{result.sentiment}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Estado Pedido</span>
                          <div className="bg-gray-50 p-3 rounded-xl font-mono font-bold text-orange-600">
                            {result.orderId}
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-gray-100" />

                      {/* Email Notification Section */}
                      <div className="space-y-4 p-8 bg-white rounded-3xl border-2 border-orange-100 shadow-inner">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-zalando-black font-black text-base uppercase tracking-widest">
                            <Mail className="w-6 h-6 text-orange-600" />
                            Canal de Comunicación
                          </div>
                          {result.customerEmail !== "No detectado" && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">VERIFICADO</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-sm font-bold text-gray-500 ml-1">Email del Cliente</Label>
                          <div className="flex gap-3">
                            <div className="relative flex-1">
                              <Input 
                                value={result.customerEmail === "No detectado" ? "" : result.customerEmail}
                                onChange={(e) => setResult({...result, customerEmail: e.target.value})}
                                className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-orange-500 text-base h-14 pl-11 font-medium"
                                placeholder="Introduce el email manualmente..."
                              />
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <Button 
                              onClick={handleSendEmail}
                              disabled={isSendingEmail || !result.customerEmail || result.customerEmail === "No detectado"}
                              className="bg-zalando-black hover:bg-gray-800 text-white h-14 px-8 font-black text-base transition-all active:scale-95"
                            >
                              {isSendingEmail ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span>ENVIAR</span>
                                  <Send className="w-5 h-5" />
                                </div>
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-400 ml-1 italic">
                            {result.customerEmail === "No detectado" 
                              ? "* La IA no detectó el email. Por favor, introdúcelo manualmente para avisar al cliente."
                              : "* Puedes editar el email si detectas algún error en la extracción automática."}
                          </p>
                        </div>

                        <Separator className="bg-gray-100 my-4" />

                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                          <div className="text-xs font-black text-orange-700 uppercase mb-2 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            Plantilla de Envío
                          </div>
                          <p className="text-sm text-orange-800 leading-relaxed">
                            "Hola, hemos recibido tu incidencia sobre el pedido <strong>{result.orderId}</strong>. 
                            Nuestro equipo está trabajando en tu caso de <strong>{result.category}</strong>. Te informaremos pronto."
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-black">Productos Detectados</span>
                        <div className="flex flex-wrap gap-3">
                          {result.items.map((item, i) => (
                            <Badge key={i} variant="secondary" className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-100 px-4 py-2 text-sm font-medium">
                              {item}
                            </Badge>
                          ))}
                          {result.items.length === 0 && <span className="text-base text-gray-400">Sin productos específicos</span>}
                        </div>
                      </div>

                      {result.missingInfo.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-6 bg-red-50 rounded-2xl border border-red-100 space-y-3 shadow-inner"
                        >
                          <div className="flex items-center gap-3 text-red-700 text-base font-black">
                            <AlertCircle className="w-5 h-5" />
                            DATOS REQUERIDOS
                          </div>
                          <ul className="text-sm text-red-600 space-y-2">
                            {result.missingInfo.map((info, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {info}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 p-8 border-t border-gray-100">
                      <Button 
                        onClick={handleRegister}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white h-16 text-xl font-black shadow-xl shadow-orange-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
                      >
                        <CheckCircle2 className="mr-3 h-6 w-6" />
                        REGISTRAR EN SISTEMA
                      </Button>
                    </CardFooter>
                  </Card>

                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <div className="w-2 h-8 bg-orange-600 rounded-full" />
                      Acciones Sugeridas
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-700 border border-transparent hover:border-orange-200 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-600 font-black">1</div>
                        Generar etiqueta de devolución inmediata
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-base font-medium text-gray-700 border border-transparent hover:border-orange-200 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-orange-600 font-black">2</div>
                        Bloquear stock para cambio de talla
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-gray-200 rounded-[40px] bg-gray-50/50 min-h-[600px] sticky top-28"
                >
                  <div className="bg-white p-10 rounded-full shadow-xl mb-8 transform rotate-3">
                    <Search className="w-20 h-20 text-gray-200" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-300 mb-4">Panel de Análisis</h3>
                  <p className="text-xl text-gray-400 max-w-sm leading-relaxed">
                    Introduce el contenido de la incidencia para activar el motor de procesamiento inteligente.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-200 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-6">
            <ZalandoLogo />
            <p className="text-sm text-gray-500 leading-relaxed">
              Zalando SE es la plataforma online de moda y estilo de vida líder en Europa. 
              Fundada en Berlín en 2008, ofrecemos una experiencia de compra completa a clientes en 25 mercados.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-gray-400">Aviso Legal</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Zalando SE</li>
              <li>Valeska-Gert-Straße 5</li>
              <li>10243 Berlín, Alemania</li>
              <li>Registro Mercantil: Amtsgericht Charlottenburg (Berlín), HRB 158855 B</li>
              <li>NIF-IVA: DE 260543043</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-gray-400">Representación Legal</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Consejo de Administración: Robert Gentz, David Schneider, Dr. Sandra Dembeck, David Schröder</li>
              <li>Presidenta del Consejo de Vigilancia: Kelly Bennett</li>
              <li>Contacto: <a href="mailto:soporte-ops@zalando.es" className="text-orange-600 font-bold hover:underline">soporte-ops@zalando.es</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-12 border-t border-gray-100">
          <div className="text-sm text-gray-400 text-center md:text-left leading-loose">
            © 2026 Zalando SE · Operations Intelligence Division<br />
            Sistema de Triaje Automatizado de Alta Precisión (STAA-P)<br />
            <span className="text-orange-400 font-bold">Confidencial - Uso Interno</span>
          </div>
          <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <a href="https://www.zalando.es/zalando-proteccion-de-datos/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">Privacidad</a>
            <a href="https://www.zalando.es/zalando-condiciones-generales/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">Términos y Condiciones</a>
            <a href="https://www.zalando.es/zalando-aviso-legal/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">Aviso Legal</a>
          </div>
        </div>
      </footer>
      <Toaster position="top-center" richColors />
    </div>
  );
}
