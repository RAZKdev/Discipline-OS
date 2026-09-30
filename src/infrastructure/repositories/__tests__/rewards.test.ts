import { describe, it, expect, beforeEach } from 'vitest';
import { LocalTaskRepository } from '../task-repository';

describe('Rewards & Entertainment Gate Engine', () => {
  let repo: LocalTaskRepository;

  beforeEach(() => {
    repo = new LocalTaskRepository();
  });

  it('loads default consistency rewards correctly', async () => {
    const rewards = await repo.getRewards('user-demo');
    expect(rewards.length).toBeGreaterThanOrEqual(4);
    expect(rewards.some((r) => r.category === 'rest')).toBe(true);
    expect(rewards.some((r) => r.category === 'entertainment')).toBe(true);
  });

  it('allows redeeming reward when points are sufficient and deducts balance', async () => {
    const rewards = await repo.getRewards('user-demo');
    const target = rewards.find((r) => r.costPoints <= 30)!;

    const initialPoints = await repo.getPointsBalance('user-demo');
    expect(initialPoints).toBeGreaterThanOrEqual(target.costPoints);

    const { reward, newPointsBalance } = await repo.redeemReward('user-demo', target.id);
    expect(reward.isRedeemed).toBe(true);
    expect(reward.redeemedAt).toBeDefined();
    expect(newPointsBalance).toBe(initialPoints - target.costPoints);

    const updatedPoints = await repo.getPointsBalance('user-demo');
    expect(updatedPoints).toBe(newPointsBalance);
  });

  it('rejects redeeming reward when points are insufficient', async () => {
    const expensive = await repo.createReward({
      userId: 'user-demo',
      title: 'Liburan Mewah',
      category: 'personal',
      costPoints: 99999, // Impossible amount
    });

    await expect(repo.redeemReward('user-demo', expensive.id)).rejects.toThrow(
      'Poin konsistensi tidak mencukupi'
    );
  });

  it('unlocks entertainment gate with custom duration', async () => {
    const unlocked = await repo.unlockEntertainmentGate('user-demo', 45);
    expect(unlocked.unlockedUntil).toBeDefined();
    const expiry = new Date(unlocked.unlockedUntil!).getTime();
    expect(expiry).toBeGreaterThan(Date.now());
  });
});
