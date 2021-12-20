import ProcessQueue from './processQueue'


const pq = new ProcessQueue(2)


for(let i = 1; i < 20; i++){
    pq.addProcess({
        fn: (x) => setTimeout(() => {
            console.log('Done', x);
        }, 500 * x),
        params: [i]
    })
}

pq.startQueue()

pq.waitForQueue()
pq.multipleProcessCount = 5

for(let i = 0; i < 20; i++){
    pq.addProcess({
        fn: (x) => setTimeout(() => {
            console.log('Done', x);
        }, 500 * x),
        params: [i]
    })
}