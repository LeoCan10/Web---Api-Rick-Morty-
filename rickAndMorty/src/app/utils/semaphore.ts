/**
 * SEMÁFORO - Control de Concurrencia
 * ===================================
 * Un semáforo es un mecanismo para limitar cuántas operaciones pueden ejecutarse simultáneamente.
 *
 * ¿Por qué es importante?
 * - localStorage es síncrono pero no es thread-safe en JavaScript
 * - Si 10 peticiones intentan leer/escribir al mismo tiempo, pueden haber conflictos
 * - Este semáforo garantiza que máximo N operaciones se ejecuten a la vez
 *
 * Ejemplo:
 *   const semaphore = new Semaphore(3);  // Máximo 3 operaciones simultáneas
 *
 *   semaphore.run(() => crear_comentario_1);  // Ejecuta inmediatamente (1/3)
 *   semaphore.run(() => crear_comentario_2);  // Ejecuta inmediatamente (2/3)
 *   semaphore.run(() => crear_comentario_3);  // Ejecuta inmediatamente (3/3)
 *   semaphore.run(() => crear_comentario_4);  // ESPERA en cola
 *   semaphore.run(() => crear_comentario_5);  // ESPERA en cola
 */
export class Semaphore {
  private currentCount = 0;  // ← Número de operaciones ACTIVAS en este momento
  private queue: (() => void)[] = [];  // ← Cola de operaciones esperando su turno

  /**
   * @param maxConcurrent - Número máximo de operaciones simultáneas permitidas
   */
  constructor(private maxConcurrent: number = 1) {}

  /**
   * ACQUIRE - Obtener permiso para ejecutar
   * =========================================
   * Se llama ANTES de ejecutar una operación.
   *
   * Flujo:
   * 1. Si hay slots disponibles (currentCount < maxConcurrent)
   *    → Incrementa contador y retorna inmediatamente
   * 2. Si NO hay slots (currentCount >= maxConcurrent)
   *    → Agrega la operación a la cola y ESPERA
   */
  async acquire(): Promise<void> {
    // ✅ HAY ESPACIO: incrementar contador y continuar
    if (this.currentCount < this.maxConcurrent) {
      this.currentCount++;
      return;
    }

    // ❌ NO HAY ESPACIO: esperar en cola
    // Crea una promesa que se resuelve cuando se libere un slot
    return new Promise((resolve) => {
      this.queue.push(resolve);  // Agrega a la cola
    });
  }

  /**
   * RELEASE - Liberar el slot y procesar siguientes operaciones
   * ==============================================================
   * Se llama DESPUÉS de terminar una operación (en finally{}).
   *
   * Flujo:
   * 1. Si hay operaciones en la cola
   *    → Sacamos la primera de la cola y la activamos
   * 2. Si NO hay cola
   *    → Solo decrementamos el contador
   */
  private release(): void {
    // Hay operaciones esperando en la cola
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();  // Saca la primera de la cola
      resolve?.();  // La activa (resuelve su promesa)
      // Nota: currentCount NO se decrementa porque otra operación toma su lugar
    } else {
      // No hay cola, solo decrementamos
      this.currentCount--;
    }
  }

  /**
   * RUN - Ejecutar una operación respetando el semáforo
   * ====================================================
   * Este es el método principal que usamos.
   *
   * Flujo completo:
   * 1. await this.acquire()  → Esperar permiso
   * 2. Ejecutar la función
   * 3. this.release()        → Liberar slot (en finally)
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();  // ← PASO 1: Esperar turno
    try {
      return await fn();   // ← PASO 2: Ejecutar operación
    } finally {
      this.release();      // ← PASO 3: Liberar slot (SIEMPRE, incluso si hay error)
    }
  }
}
