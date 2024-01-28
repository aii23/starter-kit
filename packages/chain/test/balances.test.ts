import { TestingAppChain } from '@proto-kit/sdk';
import { PrivateKey, UInt64 } from 'o1js';
import { Balances } from '../src/balances';
import { log } from '@proto-kit/common';

log.setLevel('ERROR');

describe('balances', () => {
    it('should demonstrate how balances work', async () => {
        const appChain = TestingAppChain.fromRuntime({
            modules: {
                Balances,
            },
        });

        appChain.configurePartial({
            Runtime: {
                Balances: {
                    totalSupply: UInt64.from(10000),
                },
            },
        });

        await appChain.start();

        const alicePrivateKey = PrivateKey.random();
        const alice = alicePrivateKey.toPublicKey();

        const bobPrivateKey = PrivateKey.random();
        const bob = bobPrivateKey.toPublicKey();

        appChain.setSigner(alicePrivateKey);

        const balances = appChain.runtime.resolve('Balances');

        const tx1 = await appChain.transaction(alice, () => {
            balances.addBalance(alice, UInt64.from(1000));
        });

        await tx1.sign();
        await tx1.send();

        const tx2 = await appChain.transaction(alice, () => {
            balances.addBalance(alice, UInt64.from(1000));
        });

        await tx2.sign();
        await tx2.send();

        const tx3 = await appChain.transaction(alice, () => {
            balances.transferFrom(alice, bob, UInt64.from(1000));
        });

        await tx3.sign();
        await tx3.send();

        const block = await appChain.produceBlock();

        const balance =
            await appChain.query.runtime.Balances.balances.get(alice);

        expect(block?.transactions[0].status.toBoolean()).toBe(true);
        expect(balance?.toBigInt()).toBe(1000n);
    }, 1_000_000);
});
