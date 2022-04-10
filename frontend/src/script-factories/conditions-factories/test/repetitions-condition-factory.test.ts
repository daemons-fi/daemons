import { assert, expect } from 'chai';
import { BigNumber } from 'ethers';
import { IMaxRepetitionsCondition } from '@daemons-fi/shared-definitions';
import { IRepetitionsConditionForm } from '../../../components/new-script-page/blocks/conditions/conditions-interfaces';
import { RepetitionsConditionFactory } from '../repetitions-condition-factory';


describe('Repetitions Condition Factory', () => {

    it('creates an empty condition', async () => {
        const empty = RepetitionsConditionFactory.empty();

        expect(empty.enabled).to.be.false;
        expect(empty.amount.toNumber()).to.be.equal(0);
    });

    it('returns an empty condition when trying to build from undefined json', async () => {
        const condition = RepetitionsConditionFactory.fromJson();

        assert.deepEqual(condition, RepetitionsConditionFactory.empty());
    });

    it('restores condition from json object', async () => {
        const originalCondition: IMaxRepetitionsCondition = {
            enabled: true,
            amount: BigNumber.from(7999),
        };
        const jsonCondition = JSON.parse(JSON.stringify(originalCondition));
        const condition = RepetitionsConditionFactory.fromJson(jsonCondition);

        assert.deepEqual(condition, originalCondition);
    });

    it('returns an empty condition when trying to build from disabled form', async () => {
        const form: IRepetitionsConditionForm = {
            enabled: false,
            valid: true,
            amount: 7999,
        };
        const condition = RepetitionsConditionFactory.fromForm(form);

        assert.deepEqual(condition, RepetitionsConditionFactory.empty());
    });

    it('throws error if form is enabled but not valid', async () => {
        const form: IRepetitionsConditionForm = {
            enabled: true,
            valid: false,
            amount: 7999,
        };

        const gonnaThrow = () => RepetitionsConditionFactory.fromForm(form);
        expect(gonnaThrow).to.throw('Cannot build Repetitions condition from invalid form');
    });

    it('creates a condition from an enabled form', () => {
        const form: IRepetitionsConditionForm = {
            enabled: true,
            valid: true,
            amount: 7999,
        };

        const condition = RepetitionsConditionFactory.fromForm(form);

        expect(condition.enabled).to.be.true;
        expect(condition.amount.toNumber()).to.be.equal(7999);
    });
});
