import { TestBed } from '@angular/core/testing';
import { ScenarioService } from './scenario.service';

describe('ScenarioService', () => {
    let service: ScenarioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ScenarioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('adds default bus data to legacy bus nodes without an icon', () => {
        const busNode = {
            class: 'bus',
            data: { name: 'Legacy bus' },
        } as any;
        const assetNode = {
            class: 'asset',
            data: { type: 'source' },
        } as any;

        service.transformLegacyDrawflowData({ busNode, assetNode });

        expect(busNode.data).toEqual({
            name: 'Legacy bus',
            icon: 'bus default',
            type: 'bus',
        });
        expect(busNode.html).toContain('<div class="img bus default"></div>');
        expect(busNode.html).toContain(
            '<div class="drawflow-node__name nodeName">',
        );
        expect(busNode.html.indexOf('img bus default')).toBeLessThan(
            busNode.html.indexOf('drawflow-node__name nodeName'),
        );
        expect(busNode.html).toContain('Legacy bus');
        expect(assetNode.data).toEqual({ type: 'source' });
    });

    it('does not overwrite an existing bus icon', () => {
        const busNode = {
            class: 'bus',
            data: { icon: 'custom bus', type: 'bus' },
        } as any;

        service.transformLegacyDrawflowData({ busNode });

        expect(busNode.data).toEqual({
            icon: 'custom bus',
            type: 'bus',
        });
    });

    it('renames legacy sink data to source', () => {
        const sinkNode = {
            class: 'sink',
            data: { sink: 'user_defined', name: 'Legacy sink' },
        } as any;

        service.transformLegacyDrawflowData({ sinkNode });

        expect(sinkNode.data).toEqual({
            source: 'user_defined',
            name: 'Legacy sink',
            type: 'sink',
        });
    });

    it('adds a node type from its class without overwriting an existing type', () => {
        const legacyNode = {
            class: 'source',
            data: { name: 'Legacy source' },
        } as any;
        const typedNode = {
            class: 'sink',
            data: { type: 'custom-sink' },
        } as any;

        service.transformLegacyDrawflowData({ legacyNode, typedNode });

        expect(legacyNode.data.type).toBe('source');
        expect(legacyNode.data.icon).toBe('source default');
        expect(typedNode.data.type).toBe('custom-sink');
        expect(typedNode.data.icon).toBe('custom-sink default');
    });
});
