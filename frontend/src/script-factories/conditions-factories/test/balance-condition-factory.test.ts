import { assert, expect } from 'chai';
import { ethers, utils } from 'ethers';
import itParam from 'mocha-param';
import { ComparisonType, IBalanceCondition } from '@daemons-fi/shared-definitions';
import { IBalanceConditionForm } from '../../../components/new-script-page/blocks/conditions/conditions-interfaces';
import { ZeroAddress } from '../../../data/chain-info';
import { BalanceConditionFactory } from '../balance-condition-factory';
import { Token } from '../../../data/chains-data/interfaces';


describe('Balance Condition Factory', () => {

    const tokens: Token[] = [
        {
            name: 'FooToken',
            symbol: 'FOO',
            address: '0x123',
            logoURI: '',
            decimals: 18,
        }
    ];

    it('creates an empty condition', async () => {
        const empty = BalanceConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.amount.toNumber()).to.be.equal(0);
        expect(empty.token).to.be.equal(ZeroAddress);
        expect(empty.comparison).to.be.equal(0);
    });

    it('returns an empty condition when trying to build from undefined json', async () => {
        const condition = BalanceConditionFactory.fromJson();

        assert.deepEqual(condition, BalanceConditionFactory.empty());
    });

    it('restores condition from json object', async () => {
        const originalCondition: IBalanceCondition = {
            enabled: true,
            token: '0x123',
            comparison: ComparisonType.GreaterThan,
            amount: ethers.utils.parseEther('1.255'),
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = BalanceConditionFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });

    it('returns an empty condition when trying to build from disabled form', async () => {
        const form: IBalanceConditionForm = {
            enabled: false,
            valid: true,
            tokenAddress: tokens[0].address,
            comparison: ComparisonType.GreaterThan,
            floatAmount: 125.554,
        };
        const condition = BalanceConditionFactory.fromForm(form, tokens);

        assert.deepEqual(condition, BalanceConditionFactory.empty());
    });

    it('throws error if form is enabled but not valid', async () => {
        const form: IBalanceConditionForm = {
            enabled: true,
            valid: false,
            tokenAddress: tokens[0].address,
            comparison: ComparisonType.GreaterThan,
            floatAmount: 125.554,
        };

        const gonnaThrow = () => BalanceConditionFactory.fromForm(form, tokens);
        expect(gonnaThrow).to.throw('Cannot build Balance condition from invalid form');
    });

    describe('creates a condition from an enabled form', () => {
        const form: IBalanceConditionForm = {
            enabled: true,
            valid: true,
            tokenAddress: tokens[0].address,
            comparison: ComparisonType.GreaterThan,
            floatAmount: 125.554,
        };

        it('happy flow', async () => {

            const condition = BalanceConditionFactory.fromForm(form, tokens);

            expect(condition.enabled).to.be.true;
            expect(condition.comparison).to.be.equal(ComparisonType.GreaterThan);
            expect(condition.token).to.be.equal(tokens[0].address);
            expect(condition.amount.toHexString()).to.be.equal(ethers.utils.parseEther('125.554').toHexString());
        });

        itParam(
            'condition amount depends on token decimals: ${value}',
            [18, 9, 6],
            async (decimals: number) => {
                const newTokens: Token[] = [
                    {
                        name: 'FooToken',
                        symbol: 'FOO',
                        address: '0x123',
                        logoURI: '',
                        decimals: decimals,
                    }
                ];

                const condition = BalanceConditionFactory.fromForm(form, newTokens);

                const expectedAmount = utils.parseUnits(form.floatAmount.toString(), decimals);
                expect(condition.amount.toHexString()).to.be.equal(expectedAmount.toHexString());
            });
    });

});
