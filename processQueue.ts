type IncomingProcess = {
    fn: Function;
    params: any[];
}

type Process = IncomingProcess & {
    id: number;
}
let processCounter = 0;
export default class ProcessQueue {
    private restoredProcesses = {}
    private currentlyRunningProcesses = 0
    private readonly queue = []

    constructor(
        public multipleProcessCount = 4, 
        ) {}

    addProcess(p: IncomingProcess | IncomingProcess[]): void {
        const incomingProcessList = Array.isArray(p) ? p : [p]
        const processList = incomingProcessList.map((p) => ({
            id: processCounter++,
            ...p
        }))
        this.queue.push(...processList)
    }


    async startQueue(): Promise<void> {
         for( let i = 0; i<this.multipleProcessCount; i++) {
             await this.invokeProcess(this.queue.shift())
         }
    }

    private async retryProcess(p: Process) {
        const { id } = p;
        this.restoredProcesses[id] = this.restoredProcesses[id] === undefined ? 1 : this.restoredProcesses[id] + 1
        
        if(this.restoredProcesses[id] === 3) {
            return
        }

        this.queue.unshift(p)
    }

    private async invokeProcess(p: Process) {
        if( !p ) return;
        this.currentlyRunningProcesses += 1;
        const shouldCancel = await this.invalidateRunningProcesses();
        if(shouldCancel) {
            return
        }
        try { 
            const { fn, params } = p;
            await fn(...params)
        } catch(e) {
            this.retryProcess(p)
        } finally {
            this.currentlyRunningProcesses -= 1;
            await this.invokeProcess(this.queue.shift())
        }
    }

    private async invalidateRunningProcesses() {
        const difference = this.multipleProcessCount - this.currentlyRunningProcesses
        if( difference < 0) {
            return true
        }
        if( difference > 0 ) {
            for( let i = 0; i < difference; i++) {
                await this.invokeProcess(this.queue.shift())
            }
        }
        return false
    }

    waitForQueue() {
        if(this.currentlyRunningProcesses){
            setTimeout(() => this.waitForQueue(), 500)
        }
    }
}