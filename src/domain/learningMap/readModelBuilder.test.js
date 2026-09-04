import { describe, it, expect } from 'vitest';
import { buildLearningMapView } from './readModelBuilder.js';

describe('readModelBuilder', () => {
  it('returns null if course is not published', () => {
    const course = { id: 'c1', status: 'draft' };
    const view = buildLearningMapView(course);
    expect(view).toBeNull();
  });

  it('filters out unpublished chapters and nodes', () => {
    const course = { id: 'c1', status: 'published', version: 2, title: 'Course 1' };
    const chapters = [
      { id: 'ch1', courseId: 'c1', status: 'published', title: 'Ch1' },
      { id: 'ch2', courseId: 'c1', status: 'draft', title: 'Ch2' },
    ];
    const nodes = [
      { id: 'n1', chapterId: 'ch1', status: 'published', title: 'Node 1' },
      { id: 'n2', chapterId: 'ch1', status: 'draft', title: 'Node 2' },
    ];

    const view = buildLearningMapView(course, chapters, nodes);
    
    expect(view.chapters).toHaveLength(1);
    expect(view.chapters[0].chapterId).toBe('ch1');
    expect(view.chapters[0].nodes).toHaveLength(1);
    expect(view.chapters[0].nodes[0].nodeId).toBe('n1');
  });

  it('sorts chapters and nodes by orderIndex', () => {
    const course = { id: 'c1', status: 'published' };
    const chapters = [
      { id: 'ch2', courseId: 'c1', status: 'published', orderIndex: 2 },
      { id: 'ch1', courseId: 'c1', status: 'published', orderIndex: 1 },
    ];
    const nodes = [
      { id: 'n2', chapterId: 'ch1', status: 'published', orderIndex: 2 },
      { id: 'n1', chapterId: 'ch1', status: 'published', orderIndex: 1 },
    ];

    const view = buildLearningMapView(course, chapters, nodes);
    
    expect(view.chapters[0].chapterId).toBe('ch1');
    expect(view.chapters[1].chapterId).toBe('ch2');
    expect(view.chapters[0].nodes[0].nodeId).toBe('n1');
    expect(view.chapters[0].nodes[1].nodeId).toBe('n2');
  });

  it('creates the correct lightweight metadata structure without heavy fields', () => {
    const course = { id: 'c1', status: 'published', version: 3, title: 'Course 1', orderIndex: 5, updatedAt: '2026-09-01T00:00:00Z' };
    const chapters = [
      { id: 'ch1', courseId: 'c1', status: 'published', title: 'Ch1', orderIndex: 1 }
    ];
    const nodes = [
      { 
        id: 'n1', 
        chapterId: 'ch1', 
        status: 'published', 
        title: 'Node 1', 
        objective: 'Obj', 
        rewardXp: 50, 
        tool: 'excel', 
        orderIndex: 1,
        // Heavy fields that should NOT be in the view
        starterContent: { targetCell: 'A1' },
        dataset: 'large_data',
        validationRules: {} 
      }
    ];

    const view = buildLearningMapView(course, chapters, nodes);
    
    // Core Course fields
    expect(view.courseId).toBe('c1');
    expect(view.schemaVersion).toBe(1);
    expect(view.contentVersion).toBe(3);
    expect(view.order).toBe(5);
    expect(view.updatedAt).toBe('2026-09-01T00:00:00Z');
    
    // Chapter structure
    expect(view.chapters[0].chapterId).toBe('ch1');
    
    // Node structure
    const node = view.chapters[0].nodes[0];
    expect(node.nodeId).toBe('n1');
    expect(node.nodeType).toBe('mission'); // fallback
    expect(node.title).toBe('Node 1');
    expect(node.objective).toBe('Obj');
    expect(node.rewardXp).toBe(50);
    
    // Ensure heavy fields are stripped
    expect(node.starterContent).toBeUndefined();
    expect(node.dataset).toBeUndefined();
    expect(node.validationRules).toBeUndefined();
  });
});
