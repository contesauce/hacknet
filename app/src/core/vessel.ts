import type { Shell } from '../terminal/shell';

/** Called wherever a file with `vesselShard` gets read (cat/decrypt). */
export function collectShard(shell: Shell, shardId: string) {
  if (shell.state.vesselShards.includes(shardId)) return;
  shell.state.vesselShards.push(shardId);
  shell.print(`[VESSEL] Shard collected: ${shardId} (${shell.state.vesselShards.length} total)`, 'ok');
}
