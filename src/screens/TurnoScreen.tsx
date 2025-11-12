// src/screens/TurnoScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { User, Turno } from '../hooks/useAuth';
import { useTurno } from '../hooks/useTurno';
import { useTransacciones } from '../hooks/useTransacciones';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import Toast from '../components/Common/Toast';
import FormInputCurrency from '../components/Common/FormInputCurrency';
import { TransactionModal, TransactionTable, type TransactionCategory } from '../components/Transactions';
import { catalogoService } from '../api/catalogoService';
import { turnoService } from '../api/turnoService';
import { formatCurrency, getDifferenceDisplay } from '../utils/formatUtils';
import '../styles/screens/TurnoScreen.css';

interface TurnoScreenProps {
  user: User;
  onNavigate?: (screen: string) => void;
  setUserTurno?: (turno: Turno | null) => void;
}

/**
 * LÓGICA DE NEGOCIO POR ROL:
 *
 * EMPLEADO:
 *   - Si no existe turno hoy → Mostrar botón "Crear Turno"
 *   - Si existe turno (creado por otro empleado) → Mostrar info solo lectura + "Turno ya creado por [nombre]"
 *   - Si existe turno (creado por él) → Mostrar info + botones de transacciones + cierre
 *   - Una vez cerrado → Solo lectura
 *
 * SUPERVISOR:
 *   - Ver TODOS los turnos del día
 *   - Ver quién creó cada turno
 *   - Ver estado de cada turno
 *   - Botón "Revisar Día" (si todos los turnos están CERRADOS)
 *
 * ADMIN:
 *   - Si no hay datos ese día (0 turnos + 0 transacciones) → Botón "Crear Turno Manual"
 *   - Si hay datos → Ver solo lectura
 *   - Botón "Borrar Turno" (solo si no hay transacciones + no lo creó empleado)
 */

const CATEGORIAS_TRANSACCIONES = [
  { id: 'PAGO_DIGITAL', label: '+Registrar Pago Digital', icon: '💳' },
  { id: 'COMPRA_PROV', label: '-Registrar Compra(Prov)', icon: '📦' },
  { id: 'GASTO_CAJA', label: '-Registrar Gasto de Caja', icon: '💸' },
];

const TurnoScreen: React.FC<TurnoScreenProps> = ({ user, onNavigate, setUserTurno }) => {
  const {
    turno,
    isLoading,
    error,
    success,
    initTurno,
    getCurrentTurno,
    closeTurno,
    getTurnosHistory,
    clearError,
    clearSuccess
  } = useTurno();

  const {
    transacciones,
    isLoading: transLoading,
    createTransaccion,
    getTransaccionesByTurno,
    deleteTransaccion,
  } = useTransacciones();

  // Modales de transacciones
  const [openModal, setOpenModal] = useState<TransactionCategory | null>(null);
  const [ventaReportada, setVentaReportada] = useState('');
  const [efectivoContado, setEfectivoContado] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCloseTurnoConfirm, setShowCloseTurnoConfirm] = useState(false);

  // Historial de turnos
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current'); // 'current' o 'history'
  const [turnosHistory, setTurnosHistory] = useState<any[]>([]);
  const [selectedHistoricalTurno, setSelectedHistoricalTurno] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resumenJornada, setResumenJornada] = useState<any | null>(null);

  // Catálogos
  const [tiposPagoDigital, setTiposPagoDigital] = useState<any[]>([]);
  const [tiposGasto, setTiposGasto] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [catalogosLoading, setCatalogosLoading] = useState(false);

  // Cargar turno actual al montar o cuando cambie el usuario
  useEffect(() => {
    loadTurnoData();
  }, [user.negocioId]); // getCurrentTurno está en dependencias del useCallback

  // Cargar transacciones cuando hay turno
  useEffect(() => {
    if (turno?.id) {
      loadTransacciones();
    }
  }, [turno?.id]); // getTransaccionesByTurno está en dependencias del useCallback

  // Cargar historial de turnos si es Turno #2+ (para cálculo de POS incremental)
  useEffect(() => {
    if (turno && turno.numero_turno > 1 && turno.estado === 'ABIERTO') {
      loadTurnosHistory();
    }
  }, [turno?.numero_turno, turno?.estado]); // Cargar cuando es Turno #2+ y está abierto

  // Limpiar inputs de cierre cuando cambia el turno
  useEffect(() => {
    if (turno?.id) {
      setVentaReportada('');
      setEfectivoContado('');
    }
  }, [turno?.id]);

  // Sincronizar turno con contexto global para actualizar Header
  useEffect(() => {
    if (turno && setUserTurno) {
      setUserTurno(turno);
    }
  }, [turno, setUserTurno]);

  // Cargar catálogos al montar o cuando cambie el negocio
  useEffect(() => {
    loadCatalogos();
  }, [user.negocioId]);

  const loadTurnoData = async () => {
    await getCurrentTurno(user.negocioId);
    // El turno se sincroniza con el contexto a través del useEffect que observa cambios en turno
  };

  const loadTransacciones = async () => {
    if (turno?.id) {
      await getTransaccionesByTurno(turno.id);
    }
  };

  const loadCatalogos = async () => {
    try {
      setCatalogosLoading(true);
      const [pagos, gastos, provs] = await Promise.all([
        catalogoService.getTiposPagoDigital(user.negocioId),
        catalogoService.getTiposGasto(user.negocioId),
        catalogoService.getProveedores(user.negocioId),
      ]);
      setTiposPagoDigital(pagos);
      setTiposGasto(gastos);
      setProveedores(provs);
    } catch (err) {
      console.error('Error loading catalogs:', err);
    } finally {
      setCatalogosLoading(false);
    }
  };

  const loadResumenJornada = async () => {
    try {
      const summary = await turnoService.getSummaryDay();
      if (summary) {
        setResumenJornada(summary);
        console.log('[TurnoScreen] Resumen de jornada actualizado:', summary);
      }
    } catch (summaryErr) {
      console.error('[TurnoScreen] Error loading summary:', summaryErr);
    }
  };

  const loadTurnosHistory = async () => {
    try {
      setHistoryLoading(true);
      const history = await getTurnosHistory(20, 0); // Cargar últimos 20 turnos
      setTurnosHistory(history);

      // Cargar resumen de jornada
      await loadResumenJornada();

      console.log('[TurnoScreen] Historial de turnos cargado:', history);
    } catch (err) {
      console.error('[TurnoScreen] Error loading turnos history:', err);
      setValidationError('Error al cargar historial de turnos');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewHistorial = async () => {
    setViewMode('history');
    await loadTurnosHistory();
  };

  const handleSelectHistoricalTurno = async (turnoHistorico: any) => {
    setSelectedHistoricalTurno(turnoHistorico);
    // Cargar transacciones del turno histórico
    await getTransaccionesByTurno(turnoHistorico.id);
  };

  const handleBackToCurrentTurno = () => {
    setViewMode('current');
    setSelectedHistoricalTurno(null);
    loadTransacciones();
  };

  const handleCreateTurnoClick = async () => {
    try {
      clearError();
      clearSuccess();
      console.log('Creating turno for negocioId:', user.negocioId);
      const result = await initTurno(user.negocioId);
      console.log('Turno creation result:', result);

      if (result.success) {
        // Pequeño delay para que se vea el loading antes de cargar datos
        setTimeout(() => {
          loadTurnoData();
        }, 300);
      } else {
        console.error('Failed to create turno:', result.message);
      }
    } catch (err) {
      console.error('Error creating turno:', err);
    }
  };

  const handleAddTransaction = useCallback(async (data: any) => {
    if (!turno?.id) {
      throw new Error('No hay turno activo');
    }

    try {
      console.log('[TurnoScreen] Creando transacción:', { turnoId: turno.id, ...data });

      let categoria: TransactionCategory;
      let tipoGastoId: number | undefined;
      let tipoPagoDigitalId: number | undefined;
      let proveedorId: number | undefined;

      // Mapear según el modal abierto
      if (openModal === 'PAGO_DIGITAL') {
        categoria = 'PAGO_DIGITAL';
        tipoPagoDigitalId = data.tipoPagoDigitalId;
      } else if (openModal === 'GASTO_CAJA') {
        categoria = 'GASTO_CAJA';
        tipoGastoId = data.tipoGastoId;
      } else if (openModal === 'COMPRA_PROV') {
        categoria = 'COMPRA_PROV';
        proveedorId = data.proveedorId;
      } else {
        throw new Error('Modal inválido');
      }

      await createTransaccion(
        turno.id,
        data.valor,
        categoria,
        data.concepto,
        proveedorId,
        tipoGastoId,
        tipoPagoDigitalId
      );

      console.log('[TurnoScreen] Transacción creada exitosamente');
      await loadTransacciones();
    } catch (err: any) {
      console.error('[TurnoScreen] Error al crear transacción:', err);
      throw err;
    }
  }, [turno?.id, openModal, createTransaccion]);

  const handleDeleteTransaction = useCallback(async (id: number) => {
    try {
      console.log('[TurnoScreen] Borrando transacción:', id);
      await deleteTransaccion(id);
      console.log('[TurnoScreen] Transacción borrada exitosamente');
      await loadTransacciones();
    } catch (err: any) {
      console.error('[TurnoScreen] Error al borrar transacción:', err);
      throw err;
    }
  }, [deleteTransaccion]);

  const handleCloseTurnoClick = () => {
    setShowCloseTurnoConfirm(true);
  };

  const handleCloseTurnoConfirm = async () => {
    if (!turno) return;
    try {
      clearError();
      clearSuccess();
      setValidationError(null);

      // VALIDACIÓN: Verificar que ambos campos estén llenos
      if (!ventaReportada || ventaReportada.trim() === '') {
        setValidationError('Venta reportada POS es requerida');
        return;
      }

      if (!efectivoContado || efectivoContado.trim() === '') {
        setValidationError('Efectivo contado es requerido');
        return;
      }

      // Convertir valores de texto a números
      const venta = parseFloat(ventaReportada);
      const efectivo = parseFloat(efectivoContado);

      // VALIDACIÓN: Verificar que sean números válidos y positivos
      if (isNaN(venta) || venta <= 0) {
        setValidationError('Venta reportada POS debe ser un valor positivo mayor a 0');
        return;
      }

      if (isNaN(efectivo) || efectivo <= 0) {
        setValidationError('Efectivo contado debe ser un valor positivo mayor a 0');
        return;
      }

      // VALIDACIÓN: Para Turno #2, validar que venta sea >= venta de Turno #1
      if (turno.numero_turno === 2) {
        // Obtener la venta reportada del turno anterior (T1)
        try {
          // Consultar la venta del turno #1 del mismo día
          const diaContableId = turno.dia_contable_id;
          const turnosDelDia = await turnoService.getTurnosByDay(diaContableId);
          const turno1 = turnosDelDia?.find((t: any) => t.numero_turno === 1);

          if (turno1 && turno1.venta_reportada_pos_turno) {
            const venta1 = parseFloat(turno1.venta_reportada_pos_turno) || 0;
            if (venta < venta1) {
              setValidationError(`La venta de Turno #2 (${formatCurrency(venta)}) no puede ser menor que la de Turno #1 (${formatCurrency(venta1)})`);
              return;
            }
          }
        } catch (err) {
          console.error('[TurnoScreen] Error validating T2 venta against T1:', err);
          // Continuar con validación de mínimo aunque falle esta validación
        }

        // VALIDACIÓN: Turno #2 debe tener un valor mínimo razonable (> $100)
        if (venta < 100) {
          setValidationError('La venta de Turno #2 debe ser al menos $100');
          return;
        }
      }

      // Calcular la diferencia (venta POS - suma de transacciones)
      let digitales = 0;
      let compras = 0;
      let gastos = 0;

      if (Array.isArray(transacciones)) {
        transacciones.forEach((t: any) => {
          const valor = parseFloat(t.valor) || 0;
          if (t.categoria === 'PAGO_DIGITAL') {
            digitales += valor;
          } else if (t.categoria === 'GASTO_CAJA') {
            gastos += valor;
          } else if (t.categoria === 'COMPRA_PROV') {
            compras += valor;
          }
        });
      }

      const sumaTransacciones = efectivo + digitales + compras + gastos;
      // Diferencia = suma de transacciones - venta reportada POS
      const diferencia = sumaTransacciones - venta;

      const result = await closeTurno(turno.id, venta, efectivo, diferencia);
      if (result.success) {
        setShowCloseTurnoConfirm(false);
        // Pequeño delay para que se vea el loading antes de cargar datos
        setTimeout(async () => {
          await loadTurnoData();
          // Cargar el resumen de jornada para mostrar totales actualizados en tiempo real
          await loadResumenJornada();
          // Si estamos viendo el historial, recargar también para mostrar el nuevo turno
          if (viewMode === 'history') {
            await loadTurnosHistory();
          }
        }, 300);
        // El turno se sincroniza automáticamente con el contexto a través del useEffect
      }
    } catch (err) {
      console.error('Error closing turno:', err);
    }
  };

  const handleReviewDay = () => {
    if (onNavigate) {
      onNavigate('revision');
    }
  };

  // Función helper para obtener el subtipo de una transacción
  const getSubtypeLabel = (txn: any): string => {
    switch (txn.categoria) {
      case 'PAGO_DIGITAL': {
        const tipoPago = tiposPagoDigital.find((t) => t.id === txn.tipo_pago_digital_id);
        return tipoPago?.nombre || 'Desconocido';
      }
      case 'GASTO_CAJA': {
        const tipoGasto = tiposGasto.find((t) => t.id === txn.tipo_gasto_id);
        return tipoGasto?.nombre || 'Desconocido';
      }
      case 'COMPRA_PROV': {
        const proveedor = proveedores.find((p) => p.id === txn.proveedor_id);
        return proveedor?.nombre || 'Desconocido';
      }
      default:
        return '-';
    }
  };

  // Calcular totales por categoría
  const calcularTotales = () => {
    let digitales = 0;
    let compras = 0;
    let gastos = 0;

    console.log('[TurnoScreen] Calculando totales con transacciones:', transacciones);

    // Validar que transacciones sea un array
    if (Array.isArray(transacciones)) {
      transacciones.forEach((t: any) => {
        const valor = parseFloat(t.valor) || 0;
        console.log('[TurnoScreen] Procesando transacción:', { categoria: t.categoria, valor });
        if (t.categoria === 'PAGO_DIGITAL') {
          digitales += valor;
        } else if (t.categoria === 'GASTO_CAJA') {
          gastos += valor;
        } else if (t.categoria === 'COMPRA_PROV') {
          compras += valor;
        }
      });
    }

    const ventaReportadaNum = parseFloat(ventaReportada) || 0;
    const efectivoContadoNum = parseFloat(efectivoContado) || 0;

    // La suma de transacciones suma todos los valores de transacciones:
    // suma = efectivo + pagos_digitales + compras + gastos
    const sumaTransacciones = efectivoContadoNum + digitales + compras + gastos;

    // Para Turno #2+, usar POS incremental en la fórmula de diferencia (RF2.5)
    // POS incremental = venta_reportada_actual - venta_reportada_anterior_turno
    let ventaAUsar = ventaReportadaNum;
    if (turno && turno.numero_turno > 1 && Array.isArray(turnosHistory)) {
      const turnoAnterior = turnosHistory.find((t: any) => t.numero_turno === turno.numero_turno - 1);
      if (turnoAnterior && turnoAnterior.venta_reportada_pos_turno !== null) {
        const ventaIncrementalPos = ventaReportadaNum - (turnoAnterior.venta_reportada_pos_turno || 0);
        ventaAUsar = ventaIncrementalPos;
        console.log(`[TurnoScreen] POS Incremental T${turno.numero_turno}: ${ventaReportadaNum} - ${turnoAnterior.venta_reportada_pos_turno} = ${ventaIncrementalPos}`);
      }
    }

    // La diferencia es: suma de transacciones - venta POS reportada
    // Para Turno #2+: usa POS incremental (ventaAUsar)
    // Para Turno #1: usa POS acumulado (ventaReportadaNum)
    // Si diferencia > 0 = excedente (suma > POS, sobra dinero)
    // Si diferencia < 0 = faltante (suma < POS, falta dinero)
    // Si diferencia = 0 = cuadrado (suma = POS, coincide exacto)
    const diferencia = sumaTransacciones - ventaAUsar;

    console.log('[TurnoScreen] Totales calculados:', {
      digitales,
      compras,
      gastos,
      sumaTransacciones,
      ventaReportada: ventaReportadaNum,
      efectivoContado: efectivoContadoNum,
      diferencia
    });

    return { digitales, compras, gastos, sumaTransacciones, diferencia };
  };

  const totales = calcularTotales();
  const hasTurnoData = turno !== null;

  return (
    <div className="turno-screen">
      {/* Mensaje de error */}
      {error && (
        <Card className="error-card">
          <div className="error-message">
            <strong>Error:</strong> {error}
            <Button variant="secondary" onClick={clearError} size="small">
              Descartar
            </Button>
          </div>
        </Card>
      )}

      {/* Mensaje de éxito - Toast */}
      {success && (
        <Toast
          message="✅ Operación exitosa"
          type="success"
          duration={3000}
          onClose={clearSuccess}
        />
      )}

      {/* Mensajes de validación */}
      {validationError && (
        <Card className="error-card">
          <div className="error-message">
            <strong>Error:</strong> {validationError}
            <Button variant="secondary" onClick={() => setValidationError(null)} size="small">
              Descartar
            </Button>
          </div>
        </Card>
      )}

      {/* Estado de carga */}
      {isLoading && (
        <Card>
          <div className="loading-state">
            <p>Cargando información del turno...</p>
          </div>
        </Card>
      )}

      {/* EMPLEADO */}
      {user.rol === 'empleado' && !isLoading && (
        <div className="turno-screen__empleado">
          {!turno ? (
            // No existe turno → Mostrar opción de crear
            <Card title="Crear Turno">
              <p className="turno-screen__info">
                No existe turno registrado para hoy. Sé el primero en crearlo.
              </p>
              <Button
                variant="primary"
                onClick={handleCreateTurnoClick}
                disabled={isLoading}
              >
                Crear Turno
              </Button>
            </Card>
          ) : turno.usuario_id === user.id ? (
            // Turno creado por él → Mostrar todo
            <>
              {turno.estado === 'ABIERTO' && (
                <Card title={`Turno #${turno.numero_turno} - ${turno.estado}`}>
                  <div className="turno-screen__turno-info">
                    <p>
                      <strong>Estado:</strong> {turno.estado}
                    </p>
                    <p>
                      <strong>Creado por:</strong> {user.nombreCompleto}
                    </p>
                  </div>
                </Card>
              )}

              {/* Sección REGISTRO DE TRANSACCIONES con nuevos componentes */}
              {turno.estado === 'ABIERTO' && (
                <Card title="REGISTRO DE TRANSACCIONES">
                  <div className="turno-screen__transaction-buttons">
                    <Button
                      variant="primary"
                      onClick={() => setOpenModal('PAGO_DIGITAL')}
                    >
                      + Registrar Pago Digital
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setOpenModal('COMPRA_PROV')}
                    >
                      - Registrar Compra(Prov)
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setOpenModal('GASTO_CAJA')}
                    >
                      - Registrar Gasto de Caja
                    </Button>
                  </div>

                  {/* Tabla de todas las transacciones */}
                  {transacciones.length > 0 && (
                    <div className="turno-screen__transactions-summary">
                      <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                        Transacciones de tu turno: (Mostrando {transacciones.length})
                      </p>
                      <TransactionTable
                        transactions={transacciones}
                        isReadOnly={true}
                        itemsPerPage={5}
                        showPagination={true}
                        getSubtypeOnlyLabel={getSubtypeLabel}
                      />
                    </div>
                  )}

                  {transacciones.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No hay transacciones registradas aún
                    </p>
                  )}
                </Card>
              )}

              {/* Modales de Transacciones */}
              <TransactionModal
                isOpen={openModal === 'PAGO_DIGITAL'}
                onClose={() => setOpenModal(null)}
                category="PAGO_DIGITAL"
                transactions={transacciones}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                turnoAbierto={turno.estado === 'ABIERTO'}
                subtypes={tiposPagoDigital}
                onAddNewSubtype={async (nombre) => {
                  await catalogoService.createTipoPagoDigital(user.negocioId, nombre);
                  await loadCatalogos();
                }}
              />
              <TransactionModal
                isOpen={openModal === 'GASTO_CAJA'}
                onClose={() => setOpenModal(null)}
                category="GASTO_CAJA"
                transactions={transacciones}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                turnoAbierto={turno.estado === 'ABIERTO'}
                subtypes={tiposGasto}
                onAddNewSubtype={async (nombre) => {
                  await catalogoService.createTipoGasto(user.negocioId, nombre);
                  await loadCatalogos();
                }}
              />
              <TransactionModal
                isOpen={openModal === 'COMPRA_PROV'}
                onClose={() => setOpenModal(null)}
                category="COMPRA_PROV"
                transactions={transacciones}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                turnoAbierto={turno.estado === 'ABIERTO'}
                subtypes={proveedores}
                onAddNewSubtype={async (nombre) => {
                  await catalogoService.createProveedor(user.negocioId, nombre);
                  await loadCatalogos();
                }}
              />

              {/* Sección CIERRE DE TURNO */}
              {turno.estado === 'ABIERTO' && (
                <Card title="CIERRE DE TURNO">
                  <div className="turno-screen__cierre">
                    <div className="cierre-section">
                      <FormInputCurrency
                        label="Venta Reportada por el POS"
                        placeholder="Ingresa el monto"
                        value={ventaReportada}
                        onChange={(value) => setVentaReportada(String(value))}
                        showPreview={true}
                        helperText="Ver el formato mientras escribes"
                      />
                    </div>

                    <div className="cierre-section">
                      <FormInputCurrency
                        label="Efectivo Contado en Caja"
                        placeholder="Ingresa el monto"
                        value={efectivoContado}
                        onChange={(value) => setEfectivoContado(String(value))}
                        showPreview={true}
                        helperText="Ver el formato mientras escribes"
                      />
                    </div>

                    <div className="cierre-resultado">
                      <h4>RESULTADO DEL CÁLCULO:</h4>
                      <p><strong>Efectivo Contado (Ingresado):</strong> ${formatCurrency(parseFloat(efectivoContado) || 0)}</p>
                      <p><strong>Pagos Digitales (+):</strong> ${formatCurrency(totales.digitales)}</p>
                      <p><strong>Compras (-):</strong> ${formatCurrency(totales.compras)}</p>
                      <p><strong>Gastos (-):</strong> ${formatCurrency(totales.gastos)}</p>
                      <p><strong>Total Transacciones:</strong> ${formatCurrency(totales.sumaTransacciones)}</p>
                      {(() => {
                        const diffDisplay = getDifferenceDisplay(totales.diferencia);
                        return (
                          <p style={{ color: diffDisplay.color, fontWeight: 'bold', fontSize: '16px' }}>
                            {diffDisplay.icon} DIFERENCIA: {diffDisplay.sign}${formatCurrency(Math.abs(totales.diferencia))} {diffDisplay.label}
                          </p>
                        );
                      })()}
                    </div>

                    <div className="cierre-actions">
                      <Button
                        variant="danger"
                        onClick={handleCloseTurnoClick}
                        disabled={isLoading}
                      >
                        🔒 CERRAR TURNO Y SALIR
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Turno cerrado - Info simple */}
              {turno.estado === 'CERRADO' && viewMode === 'current' && (
                <>
                  <Card title={`Turno #${turno.numero_turno} - ${turno.estado}`}>
                    <div className="turno-screen__turno-info">
                      <p>
                        <strong>Estado:</strong> {turno.estado}
                      </p>
                      <p>
                        <strong>Creado por:</strong> {user.nombreCompleto}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleViewHistorial}
                      style={{ marginTop: '20px', width: '100%' }}
                    >
                      📋 Ver Mis Turnos Cerrados
                    </Button>
                  </Card>

                  {/* Botón para crear siguiente turno */}
                  {turno.numero_turno < 2 ? (
                    <Card title="Siguiente Turno">
                      <p className="turno-screen__info">
                        El Turno {turno.numero_turno} ha sido cerrado. Puedes iniciar el Turno {turno.numero_turno + 1} si es necesario.
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleCreateTurnoClick}
                        disabled={isLoading}
                      >
                        📋 Crear Turno {turno.numero_turno + 1}
                      </Button>
                    </Card>
                  ) : (
                    <Card title="Jornada Completa">
                      <p className="turno-screen__info">
                        ✓ Ambos turnos del día han sido cerrados. La jornada ha finalizado.
                      </p>
                    </Card>
                  )}
                </>
              )}
            </>
          ) : (
            // Turno creado por otro empleado → Solo lectura
            <>
              <Card title={`Turno #${turno.numero_turno} - ${turno.estado}`} className="turno-screen__readonly">
                <div className="turno-screen__turno-info">
                  <p className="turno-screen__alert">
                    🔒 Este turno fue abierto por otro empleado
                  </p>
                  <p>
                    <strong>Creado por:</strong> {turno.usuario_nombre || 'Desconocido'}
                  </p>
                  <p>
                    <strong>Estado:</strong> {turno.estado}
                  </p>
                  <p className="turno-screen__info">
                    Espera a que {turno.usuario_nombre || 'el empleado'} cierre el turno para poder abrir uno nuevo.
                  </p>
                </div>
              </Card>

              {/* Transacciones registradas - Solo lectura */}
              {transacciones.length > 0 && (
                <Card title="Transacciones registradas (Solo lectura)">
                  <div className="turno-screen__transactions-summary">
                    <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                      Transacciones: ({transacciones.length})
                    </p>
                    <TransactionTable
                      transactions={transacciones}
                      isReadOnly={true}
                      itemsPerPage={5}
                      showPagination={true}
                    />
                  </div>
                </Card>
              )}
            </>
          )}

          {/* VISTA DE HISTORIAL DE TURNOS */}
          {viewMode === 'history' && !selectedHistoricalTurno && (
            <div className="turno-screen__historial">
              {/* CARD 1: Tabla de Historial - PRIMERO (Mayor interacción) */}
              <Card title="📋 Turnos Cerrados">
                <Button
                  variant="secondary"
                  onClick={handleBackToCurrentTurno}
                  style={{ marginBottom: '20px' }}
                >
                  ← Volver al turno actual
                </Button>

                {historyLoading ? (
                  <p style={{ textAlign: 'center', color: '#999' }}>Cargando historial...</p>
                ) : turnosHistory.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#999' }}>No hay turnos cerrados registrados</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Turno #</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Cerrado por</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Estado</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Venta Reportada</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Diferencia</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {turnosHistory.map((turnoHist) => (
                          <tr
                            key={turnoHist.id}
                            style={{
                              borderBottom: '1px solid #eee',
                              backgroundColor: '#fff',
                              '&:hover': { backgroundColor: '#f9f9f9' }
                            }}
                          >
                            <td style={{ padding: '12px' }}>#{turnoHist.numero_turno}</td>
                            <td style={{ padding: '12px' }}>
                              {new Date(turnoHist.created_at).toLocaleDateString('es-CO')}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {turnoHist.creado_por || 'N/A'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  backgroundColor: turnoHist.estado === 'CERRADO' ? '#fff3e0' : '#e3f2fd',
                                  color: turnoHist.estado === 'CERRADO' ? '#f57c00' : '#1976d2'
                                }}
                              >
                                {turnoHist.estado}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {formatCurrency(parseFloat(turnoHist.venta_reportada_pos_turno || 0))}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>
                              {(() => {
                                const diff = parseFloat(turnoHist.diferencia_calculada_turno || 0);
                                const diffDisplay = getDifferenceDisplay(diff);
                                return `${diffDisplay.sign}${formatCurrency(Math.abs(diff))}`;
                              })()}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <Button
                                variant="primary"
                                onClick={() => handleSelectHistoricalTurno(turnoHist)}
                                size="small"
                              >
                                VER RESUMEN
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RESUMEN DE JORNADA - Dentro de la misma Card */}
                {resumenJornada && (
                  <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>📊 Resumen de Jornada</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #1976d2' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Venta POS del Día</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                          ${formatCurrency(resumenJornada.venta_pos_dia || 0)}
                        </p>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #388e3c' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Efectivo del Día</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                          ${formatCurrency(resumenJornada.efectivo_dia || 0)}
                        </p>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #2e7d32' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Pagos Digitales</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                          +${formatCurrency(resumenJornada.pagos_digitales_dia || 0)}
                        </p>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #d32f2f' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Compras + Gastos</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}>
                          -${formatCurrency((resumenJornada.compras_dia || 0) + (resumenJornada.gastos_dia || 0))}
                        </p>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #f57c00', gridColumn: '1 / -1' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Diferencia Total del Día</p>
                        {(() => {
                          const diffDisplay = getDifferenceDisplay(resumenJornada.diferencia_dia || 0);
                          return (
                            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: diffDisplay.color }}>
                              {diffDisplay.icon} {diffDisplay.sign}${formatCurrency(Math.abs(resumenJornada.diferencia_dia || 0))} {diffDisplay.label}
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* CARD 2: Turno Cerrado - SEGUNDO (Info simple del turno actual cerrado) */}
              {turno && turno.estado === 'CERRADO' && (
                <Card title={`Turno #${turno.numero_turno} - ${turno.estado}`}>
                  <div className="turno-screen__turno-info">
                    <p>
                      <strong>Estado:</strong> {turno.estado}
                    </p>
                    <p>
                      <strong>Creado por:</strong> {user.nombreCompleto}
                    </p>
                  </div>
                </Card>
              )}

              {/* CARD 3: Siguiente Turno - TERCERO (Menos prioritario) */}
              {turno && turno.estado === 'CERRADO' && turno.numero_turno < 2 && (
                <Card title="Siguiente Turno">
                  <p className="turno-screen__info">
                    El Turno {turno.numero_turno} ha sido cerrado. Puedes iniciar el Turno {turno.numero_turno + 1} si es necesario.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleCreateTurnoClick}
                    disabled={isLoading}
                  >
                    📋 Crear Turno {turno.numero_turno + 1}
                  </Button>
                </Card>
              )}

              {/* CARD 3B: Jornada Completa (cuando ya hay 2 turnos) */}
              {turno && turno.estado === 'CERRADO' && turno.numero_turno >= 2 && (
                <Card title="Jornada Completa">
                  <p className="turno-screen__info">
                    ✓ Ambos turnos del día han sido cerrados. La jornada ha finalizado.
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* MODAL DE RESUMEN DE TURNO HISTÓRICO */}
          {viewMode === 'history' && selectedHistoricalTurno && (
            <div
              className="turno-screen__modal-overlay"
              onClick={() => setSelectedHistoricalTurno(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <div
                className="turno-screen__modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  maxWidth: '600px',
                  width: '90%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0 }}>📋 Turno #{selectedHistoricalTurno.numero_turno} - RESUMEN</h2>
                  <button
                    onClick={() => setSelectedHistoricalTurno(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#666',
                      padding: 0
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="turno-screen__turno-info" style={{ marginBottom: '20px' }}>
                  <p>
                    <strong>Fecha:</strong> {new Date(selectedHistoricalTurno.created_at).toLocaleDateString('es-CO')}
                  </p>
                  <p>
                    <strong>Estado:</strong> {selectedHistoricalTurno.estado}
                  </p>
                  <p>
                    <strong>Venta Reportada POS:</strong> ${formatCurrency(parseFloat(selectedHistoricalTurno.venta_reportada_pos_turno || 0))}
                  </p>
                  <p>
                    <strong>Efectivo Contado:</strong> ${formatCurrency(parseFloat(selectedHistoricalTurno.efectivo_contado_turno || 0))}
                  </p>
                  <p>
                    {(() => {
                      const diffVal = parseFloat(selectedHistoricalTurno.diferencia_calculada_turno || 0);
                      const diffDisplay = getDifferenceDisplay(diffVal);
                      return (
                        <span style={{ color: diffDisplay.color }}>
                          <strong>Diferencia Calculada:</strong> {diffDisplay.icon} {diffDisplay.sign}${formatCurrency(Math.abs(diffVal))} {diffDisplay.label}
                        </span>
                      );
                    })()}
                  </p>
                </div>

                {/* Transacciones del turno histórico */}
                {transacciones.length > 0 && (
                  <div className="turno-screen__transactions-summary">
                    <p style={{ marginBottom: '12px', fontWeight: 'bold' }}>
                      📊 Transacciones ({transacciones.length}):
                    </p>
                    <TransactionTable
                      transactions={transacciones}
                      isReadOnly={true}
                      itemsPerPage={5}
                      showPagination={true}
                      getSubtypeOnlyLabel={getSubtypeLabel}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUPERVISOR */}
      {user.rol === 'supervisor' && !isLoading && (
        <div className="turno-screen__supervisor">
          <Card title="Turnos del Día">
            {turno ? (
              <div className="turno-screen__turno-info">
                <p>
                  <strong>Turno #${turno.numero_turno}</strong>
                </p>
                <p>
                  <strong>Estado:</strong> {turno.estado}
                </p>
              </div>
            ) : (
              <p className="turno-screen__info">No hay turnos registrados para hoy.</p>
            )}

            {turno && turno.estado === 'CERRADO' && (
              <div className="turno-screen__actions">
                <Button
                  variant="success"
                  onClick={handleReviewDay}
                >
                  Revisar Día
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ADMIN */}
      {user.rol === 'administrador' && !isLoading && (
        <div className="turno-screen__admin">
          {!hasTurnoData ? (
            // No hay datos → Modo recuperación
            <Card title="Gestión de Turno (Modo Recuperación)">
              <p className="turno-screen__info">
                No hay datos registrados para hoy. Puedes crear un turno manual para inicializar.
              </p>
              <Button
                variant="primary"
                onClick={handleCreateTurnoClick}
                disabled={isLoading}
              >
                Crear Turno Manual
              </Button>
            </Card>
          ) : (
            // Hay datos → Solo lectura
            <Card title={`Turno #${turno.numero_turno}`}>
              <div className="turno-screen__turno-info">
                <p>
                  <strong>Estado:</strong> {turno.estado}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Diálogo de confirmación para cerrar turno */}
      <ConfirmDialog
        isOpen={showCloseTurnoConfirm}
        title="Confirmar cierre de turno"
        message="¿Está seguro que desea cerrar el turno? Una vez cerrado, no podrá realizar más cambios o registrar transacciones."
        confirmText="Cerrar Turno"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleCloseTurnoConfirm}
        onCancel={() => {
          setShowCloseTurnoConfirm(false);
          setValidationError(null); // Limpiar error al cerrar modal
        }}
        isLoading={isLoading}
        error={validationError}
      />
    </div>
  );
};

export default TurnoScreen;
