// Simple autocannon runner that hits GET /api/todos
import autocannon from 'autocannon';

const url = process.env.BENCH_URL || 'http://localhost:3000/api/todos';
console.log(`Running bench against ${url} ...`);

autocannon(
  {
    url,
    connections: 30,
    duration: 10
  },
  (err, result) => {
    if (err) {
      console.error('bench error', err);
      process.exit(1);
    }
    console.log(autocannon.printResult(result));
    process.exit(0);
  }
);
