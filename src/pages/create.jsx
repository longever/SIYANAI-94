// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Play, Save, Download, GripVertical, Trash2, Settings } from 'lucide-react';

import { TimelineNodeCard } from '@/components/TimelineNodeCard';
import { NodeConfigurationModal } from '@/components/NodeConfigurationModal';
import { ScriptGeneratorModal } from '@/components/ScriptGeneratorModal';

// 移除 @dnd-kit 相关导入，使用原生拖拽实现
function DraggableTimelineNode({
  node,
  index,
  onUpdate,
  onDelete,
  onConfigure,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDragStart = e => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    onDragStart(node.id);
  };
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  return <div draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={onDragOver} onDrop={onDrop} className={`relative ${isDragging ? 'opacity-50' : ''} cursor-move`}>
      <div className="absolute -top-2 -left-2 z-10">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <TimelineNodeCard node={node} index={index} onUpdate={onUpdate} onDelete={onDelete} onConfigure={onConfigure} />
    </div>;
}
export default function CreatePage(props) {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates, setTemplates] = useState([]);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const {
    toast
  } = useToast();
  const timelineRef = useRef(null);

  // 加载视频节点数据
  const loadVideoNodes = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'asc'
          }],
          select: {
            $master: true
          }
        }
      });
      const formattedNodes = result.records.map(node => ({
        id: node._id,
        title: node.title || `节点 ${node.order + 1}`,
        text: node.text || '',
        generationType: node.type || 'text2video',
        provider: node.provider || 'tongyi',
        shotType: node.params?.shotSize || 'medium',
        transition: node.params?.transition || 'fade',
        colorStyle: node.params?.colorStyle || 'cinematic',
        duration: node.duration || 10,
        assets: {
          image: node.assets?.images?.[0] || null,
          audio: node.assets?.audio || null,
          subtitle: node.assets?.subtitle || null
        },
        order: node.order || 0,
        scriptTemplateId: node.scriptTemplateId || null
      }));
      setNodes(formattedNodes);
    } catch (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 加载脚本模板
  const loadScriptTemplates = async () => {
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'script_template',
        methodName: 'wedaGetRecordsV2',
        params: {
          where: {
            isActive: {
              $eq: true
            }
          },
          select: {
            $master: true
          }
        }
      });
      const formattedTemplates = result.records.map(template => ({
        value: template._id,
        label: template.name,
        description: template.description,
        defaultNodes: template.defaultNodes || []
      }));
      setTemplates(formattedTemplates);
    } catch (error) {
      toast({
        title: "加载模板失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    loadVideoNodes();
    loadScriptTemplates();
  }, []);

  // 添加节点
  const addNode = async () => {
    const newNode = {
      title: `节点 ${nodes.length + 1}`,
      text: '新节点内容',
      type: 'text2video',
      provider: 'tongyi',
      params: {
        shotSize: 'medium',
        transition: 'fade',
        colorStyle: 'cinematic'
      },
      assets: {
        images: [],
        audio: null,
        subtitle: null
      },
      order: nodes.length,
      duration: 10
    };
    try {
      const result = await props.$w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaCreateV2',
        params: {
          data: newNode
        }
      });
      const createdNode = {
        ...newNode,
        id: result.id,
        generationType: newNode.type,
        assets: {
          image: null,
          audio: null,
          subtitle: null
        }
      };
      setNodes([...nodes, createdNode]);
      toast({
        title: "节点已添加",
        description: "新节点已创建"
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 更新节点
  const updateNode = async (nodeId, updates) => {
    try {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      const updateData = {
        title: updates.title || node.title,
        text: updates.text || node.text,
        type: updates.generationType || node.generationType,
        provider: updates.provider || node.provider,
        params: {
          shotSize: updates.shotType || node.shotType,
          transition: updates.transition || node.transition,
          colorStyle: updates.colorStyle || node.colorStyle
        },
        assets: {
          images: updates.assets?.image ? [updates.assets.image] : node.assets?.image ? [node.assets.image] : [],
          audio: updates.assets?.audio || node.assets?.audio || null,
          subtitle: updates.assets?.subtitle || node.assets?.subtitle || null
        },
        duration: updates.duration || node.duration,
        order: updates.order !== undefined ? updates.order : node.order
      };
      await props.$w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaUpdateV2',
        params: {
          data: updateData,
          filter: {
            where: {
              _id: {
                $eq: nodeId
              }
            }
          }
        }
      });
      setNodes(nodes.map(node => node.id === nodeId ? {
        ...node,
        ...updates
      } : node));
      toast({
        title: "节点已更新",
        description: "节点配置已保存"
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 删除节点
  const deleteNode = async nodeId => {
    try {
      await props.$w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: nodeId
              }
            }
          }
        }
      });
      setNodes(nodes.filter(node => node.id !== nodeId));

      // 重新排序剩余节点
      const remainingNodes = nodes.filter(node => node.id !== nodeId);
      for (let i = 0; i < remainingNodes.length; i++) {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'video_node',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              order: i
            },
            filter: {
              where: {
                _id: {
                  $eq: remainingNodes[i].id
                }
              }
            }
          }
        });
      }
      toast({
        title: "节点已删除",
        description: "节点已从时间轴移除"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 拖拽开始
  const handleDragStart = nodeId => {
    setDraggedNodeId(nodeId);
  };

  // 拖拽悬停
  const handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 拖拽放置
  const handleDrop = (e, targetNodeId) => {
    e.preventDefault();
    if (!draggedNodeId || draggedNodeId === targetNodeId) return;
    const draggedIndex = nodes.findIndex(n => n.id === draggedNodeId);
    const targetIndex = nodes.findIndex(n => n.id === targetNodeId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newNodes = [...nodes];
    const [draggedNode] = newNodes.splice(draggedIndex, 1);
    newNodes.splice(targetIndex, 0, draggedNode);

    // 更新顺序
    const updatedNodes = newNodes.map((node, index) => ({
      ...node,
      order: index
    }));
    setNodes(updatedNodes);

    // 批量更新数据库
    Promise.all(updatedNodes.map((node, index) => props.$w.cloud.callDataSource({
      dataSourceName: 'video_node',
      methodName: 'wedaUpdateV2',
      params: {
        data: {
          order: index
        },
        filter: {
          where: {
            _id: {
              $eq: node.id
            }
          }
        }
      }
    }))).catch(error => {
      toast({
        title: "排序失败",
        description: error.message,
        variant: "destructive"
      });
    });
    setDraggedNodeId(null);
  };

  // 从脚本生成节点
  const generateFromScript = async generatedNodes => {
    try {
      // 先清空现有节点
      for (const node of nodes) {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'video_node',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: node.id
                }
              }
            }
          }
        });
      }

      // 批量创建新节点
      const newNodes = [];
      for (let i = 0; i < generatedNodes.length; i++) {
        const node = generatedNodes[i];
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'video_node',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              title: node.title || `节点 ${i + 1}`,
              text: node.text,
              type: node.generationType,
              provider: 'tongyi',
              params: {
                shotSize: node.shotType,
                transition: node.transition,
                colorStyle: node.colorStyle
              },
              assets: {
                images: [],
                audio: null,
                subtitle: null
              },
              order: i,
              duration: node.duration
            }
          }
        });
        newNodes.push({
          ...node,
          id: result.id
        });
      }
      setNodes(newNodes);
      toast({
        title: "脚本生成成功",
        description: `已生成 ${newNodes.length} 个节点`
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 应用模板
  const applyTemplate = async templateId => {
    try {
      const template = templates.find(t => t.value === templateId);
      if (!template) return;

      // 先清空现有节点
      for (const node of nodes) {
        await props.$w.cloud.callDataSource({
          dataSourceName: 'video_node',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: node.id
                }
              }
            }
          }
        });
      }

      // 根据模板创建新节点
      const newNodes = [];
      for (let i = 0; i < template.defaultNodes.length; i++) {
        const node = template.defaultNodes[i];
        const result = await props.$w.cloud.callDataSource({
          dataSourceName: 'video_node',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              title: node.title,
              text: node.text,
              type: node.type,
              provider: 'tongyi',
              params: {
                shotSize: node.params?.shotSize || 'medium',
                transition: node.params?.transition || 'fade',
                colorStyle: node.params?.colorStyle || 'cinematic'
              },
              assets: {
                images: [],
                audio: null,
                subtitle: null
              },
              order: i,
              duration: node.params?.duration || 10,
              scriptTemplateId: templateId
            }
          }
        });
        newNodes.push({
          ...node,
          id: result.id,
          generationType: node.type
        });
      }
      setNodes(newNodes);
      setSelectedTemplate(templateId);
      toast({
        title: "模板已应用",
        description: `已加载 ${newNodes.length} 个节点`
      });
    } catch (error) {
      toast({
        title: "应用模板失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const totalDuration = nodes.reduce((sum, node) => sum + (node.duration || 10), 0);
  return <div className="h-screen flex flex-col bg-background">
      {/* 顶部工具栏 */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">时间轴编辑器</h1>
            <div className="text-sm text-muted-foreground">
              总时长: {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setScriptModalOpen(true)}>
              脚本自动生成
            </Button>
            
            <Select value={selectedTemplate} onValueChange={applyTemplate}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="选择脚本模板" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => <SelectItem key={template.value} value={template.value} className="text-sm">
                    {template.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            
            <Button size="sm" onClick={addNode}>
              <Plus className="h-4 w-4 mr-1" />
              添加节点
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" />
                预览
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 时间轴区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="h-full flex items-center px-6" ref={timelineRef}>
            {nodes.length === 0 ? <div className="w-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="text-lg mb-4">开始创建你的视频</div>
                <Button onClick={addNode} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  添加第一个节点
                </Button>
              </div> : <div className="flex gap-4 items-center">
                {nodes.map((node, index) => <DraggableTimelineNode key={node.id} node={node} index={index} onUpdate={updateNode} onDelete={deleteNode} onConfigure={node => {
              setSelectedNode(node);
              setConfigModalOpen(true);
            }} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={e => handleDrop(e, node.id)} />)}
                <Button variant="outline" className="w-20 h-32 border-dashed" onClick={addNode}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>}
          </div>
        </div>
      </div>

      {/* 配置弹窗 */}
      <NodeConfigurationModal open={configModalOpen} onOpenChange={setConfigModalOpen} node={selectedNode} onSave={updatedNode => {
      if (selectedNode) {
        updateNode(selectedNode.id, updatedNode);
      }
    }} />

      {/* 脚本生成弹窗 */}
      <ScriptGeneratorModal open={scriptModalOpen} onOpenChange={setScriptModalOpen} onGenerate={generateFromScript} />
    </div>;
}