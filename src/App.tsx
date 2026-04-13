/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Info, Scale, Ruler, ArrowRight, RefreshCcw, Heart, AlertCircle, Flame, Utensils, Activity, User, TrendingUp, TrendingDown, Calendar, Eye, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';

type UnitSystem = 'metric' | 'imperial';
type Gender = 'male' | 'female';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  description: string;
  tips: string[];
}

export default function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<number>(30);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);
  
  // Daily energy balance states
  const [dailyIntake, setDailyIntake] = useState<number>(2000);
  const [extraExpenditure, setExtraExpenditure] = useState<number>(300);
  const [activityLevel, setActivityLevel] = useState<string>('office');
  const [projectionType, setProjectionType] = useState<'weekly' | 'monthly' | null>(null);
  const [showRangeDialog, setShowRangeDialog] = useState(false);
  const [showBfpDialog, setShowBfpDialog] = useState(false);

  const BFP_DATA = {
    female: [
      { range: '10-13%', category: '必需脂肪', features: '肌肉线条非常明显，血管清晰可见。常见于高水平健美运动员。', impact: '可能月经失调或停经，能量水平低，免疫力下降。不适宜长期维持。' },
      { range: '14-20%', category: '运动员级', features: '身材紧致，能看到腹肌和马甲线，肌肉分离度好。', impact: '健康，体能好。但部分女性在此区间下段也可能月经不规律。' },
      { range: '21-24%', category: '健康/理想', features: '身体曲线流畅平坦，没有明显赘肉，但腹肌不清晰。多数人眼中的“好身材”。', impact: '最佳健康区间。激素水平稳定，代谢功能良好。' },
      { range: '25-31%', category: '可接受/正常', features: '身体柔软，腰腹部、臀部、大腿有可捏起的皮下脂肪。体型匀称不显胖。', impact: '健康风险低，是多数普通女性的正常水平。' },
      { range: '32-40%', category: '超重', features: '腰腹、臀腿脂肪堆积明显，体型开始显得丰满或臃肿。', impact: '代谢疾病（如糖尿病、高血脂）风险开始升高。' },
      { range: '41%+', category: '肥胖', features: '明显肥胖，腹部、臀部、背部有大量脂肪堆积。', impact: '高风险。心血管疾病、高血压、脂肪肝、关节压力等问题显著增加。' },
    ],
    male: [
      { range: '3-5%', category: '必需脂肪', features: '肌肉线条如解剖图，青筋暴起（俗称“拉丝”）。常见于顶级健美运动员比赛期。', impact: '非常不健康。免疫力极低，内分泌紊乱，体能虚弱。无法长期维持。' },
      { range: '6-13%', category: '运动员级', features: '腹肌清晰可见，身体各部位肌肉线条分明，肩臂血管明显。', impact: '健康，体能充沛。但对激素分泌有轻度影响，需严格控制饮食。' },
      { range: '14-17%', category: '健康/理想', features: '腹肌轮廓若隐若现，身体没有明显赘肉，腰围较小。是“精壮”或“匀称”体型。', impact: '最佳健康区间。新陈代谢良好，心血管风险低。' },
      { range: '18-21%', category: '可接受/正常', features: '身体结实，但有小肚腩，腰部有可捏起的脂肪。不胖不瘦的普通身材。', impact: '健康风险低，属于正常范围。' },
      { range: '22-30%', category: '超重', features: '腰腹部明显突出，腰部脂肪层较厚，体型显胖。', impact: '代谢综合征、睡眠呼吸暂停、心脏病风险明显增高。' },
      { range: '31%+', category: '肥胖', features: '腹部、胸部、背部等大量脂肪堆积，体型呈明显肥胖。', impact: '高风险。与女性一样，面临严重的慢性病风险。' },
    ]
  };

  const getBfpCategoryColor = (category: string) => {
    switch (category) {
      case '必需脂肪':
      case '运动员级':
        return 'bg-sky-50 text-sky-600 border-sky-100';
      case '健康/理想':
      case '可接受/正常':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case '超重':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case '肥胖':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  const ACTIVITY_LEVELS = [
    { id: 'rest', label: '完全躺平', factor: 1.1, description: '全天静卧或极少活动' },
    { id: 'office', label: '办公室坐班', factor: 1.2, description: '久坐办公，极少运动' },
    { id: 'home', label: '家庭休息', factor: 1.3, description: '日常家务，轻微活动' },
    { id: 'light_labor', label: '轻体力劳动', factor: 1.5, description: '站立工作，较多走动' },
    { id: 'heavy_labor', label: '重体力劳动', factor: 1.8, description: '高强度体力活' },
  ];

  const bmiResult = useMemo((): BMIResult | null => {
    let bmiValue = 0;
    if (unitSystem === 'metric') {
      if (height > 0) {
        bmiValue = weight / ((height / 100) ** 2);
      }
    } else {
      const totalInches = heightFt * 12 + heightIn;
      if (totalInches > 0) {
        bmiValue = (703 * weightLbs) / (totalInches ** 2);
      }
    }

    if (bmiValue === 0) return null;

    let category = '';
    let color = '';
    let description = '';
    let tips: string[] = [];

    if (bmiValue < 18.5) {
      category = '体重过轻';
      color = 'text-blue-500 bg-blue-50 border-blue-200';
      description = '您的 BMI 低于健康范围。确保摄入足够的营养非常重要。';
      tips = ['关注营养密集的食物', '增加进餐次数', '考虑通过力量训练增加肌肉量'];
    } else if (bmiValue < 24) {
      category = '体重正常';
      color = 'text-emerald-500 bg-emerald-50 border-emerald-200';
      description = '恭喜！您的体重处于健康范围内。';
      tips = ['保持目前的健康习惯', '坚持体育锻炼', '保持均衡饮食'];
    } else if (bmiValue < 28) {
      category = '超重';
      color = 'text-amber-500 bg-amber-50 border-amber-200';
      description = '您的 BMI 略高于健康范围。微小的改变就能带来巨大的不同。';
      tips = ['增加日常活动量', '控制每餐分量', '选择全谷物而非精制碳水'];
    } else {
      category = '肥胖';
      color = 'text-rose-500 bg-rose-50 border-rose-200';
      description = '您的 BMI 显示肥胖。这可能会增加患某些健康状况的风险。';
      tips = ['咨询医疗保健专业人员', '设定现实的减重目标', '专注于可持续的生活方式改变'];
    }

    return { bmi: parseFloat(bmiValue.toFixed(1)), category, color, description, tips };
  }, [unitSystem, weight, height, weightLbs, heightFt, heightIn]);

  // BMR Calculation (Mifflin-St Jeor Equation)
  const bmr = useMemo(() => {
    let w = weight;
    let h = height;
    
    if (unitSystem === 'imperial') {
      w = weightLbs * 0.453592;
      h = (heightFt * 12 + heightIn) * 2.54;
    }
    
    if (gender === 'male') {
      return Math.round(10 * w + 6.25 * h - 5 * age + 5);
    } else {
      return Math.round(10 * w + 6.25 * h - 5 * age - 161);
    }
  }, [gender, age, weight, height, weightLbs, heightFt, heightIn, unitSystem]);

  const activityFactor = ACTIVITY_LEVELS.find(l => l.id === activityLevel)?.factor || 1.2;
  const totalExpenditure = Math.round(bmr * activityFactor) + extraExpenditure;
  const energyBalance = dailyIntake - totalExpenditure;
  
  // Predict monthly weight change (7700 kcal ≈ 1kg fat)
  const monthlyWeightChange = parseFloat(((energyBalance || 0) * 30 / 7700).toFixed(2));

  // Body Composition Estimates (Approximate)
  const bodyComposition = useMemo(() => {
    if (!bmiResult) return null;
    
    // Deurenberg formula for Body Fat %
    const bfp = (1.20 * bmiResult.bmi) + (0.23 * age) - (10.8 * (gender === 'male' ? 1 : 0)) - 5.4;
    
    // Use correct weight for calculations
    let w = weight;
    if (unitSystem === 'imperial') {
      w = weightLbs * 0.453592;
    }

    // Simple estimations
    const waterPercent = gender === 'male' ? 0.60 : 0.55;
    const water = w * waterPercent;
    const boneMass = gender === 'male' ? w * 0.045 : w * 0.035;
    
    // Muscle mass estimation (approximate skeletal muscle mass)
    const muscleMass = w * (1 - (bfp / 100)) * 0.57;
    
    // Visceral fat level estimation (rough level 1-30)
    const visceralLevel = Math.max(1, Math.round((bmiResult.bmi * 0.4) + (age * 0.05) - (gender === 'male' ? 2 : 5)));
    
    return {
      fat: (Math.max(Math.min(bfp, 50), 5) || 0).toFixed(1),
      water: (water || 0).toFixed(1),
      bone: (boneMass || 0).toFixed(1),
      muscle: (muscleMass || 0).toFixed(1),
      visceral: visceralLevel
    };
  }, [bmiResult, age, gender, weight, weightLbs, unitSystem]);

  const projectionData = useMemo(() => {
    if (!projectionType) return [];
    
    const data = [];
    const now = new Date();
    let currentW = unitSystem === 'metric' ? weight : weightLbs * 0.453592;
    const h = unitSystem === 'metric' ? height : (heightFt * 12 + heightIn) * 2.54;
    
    const iterations = projectionType === 'weekly' ? 4 : 6;
    const daysPerStep = projectionType === 'weekly' ? 7 : 30;
    
    for (let i = 1; i <= iterations; i++) {
      const days = i * daysPerStep;
      const weightChange = (energyBalance * days) / 7700;
      const projectedW = currentW + weightChange;
      
      // Calculate BMI for this projected weight
      const projectedBMI = projectedW / ((h / 100) ** 2);
      
      const date = new Date(now);
      date.setDate(now.getDate() + days);
      
      data.push({
        label: projectionType === 'weekly' ? `第 ${i} 周` : `第 ${i} 个月`,
        date: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' }),
        weight: unitSystem === 'metric' ? (projectedW || 0).toFixed(1) : ((projectedW / 0.453592) || 0).toFixed(1),
        bmi: (projectedBMI || 0).toFixed(1),
        change: (weightChange || 0).toFixed(1)
      });
    }
    return data;
  }, [projectionType, energyBalance, weight, weightLbs, height, heightFt, heightIn, unitSystem]);

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    if (newGender === 'male') {
      setHeight(170);
      setWeight(70);
      setWeightLbs(154.3);
      setHeightFt(5);
      setHeightIn(6.9);
    } else {
      setHeight(160);
      setWeight(50);
      setWeightLbs(110.2);
      setHeightFt(5);
      setHeightIn(3.0);
    }
  };

  const reset = () => {
    setWeight(70);
    setHeight(170);
    setWeightLbs(154);
    setHeightFt(5);
    setHeightIn(7);
    setAge(30);
    setGender('male');
    setDailyIntake(2000);
    setExtraExpenditure(300);
    setActivityLevel('office');
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-4"
          >
            <Calculator className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
          >
            BMI 健康计算器
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            计算您的身体质量指数 (BMI)，了解您的体重与身高的关系，并获取个性化的健康洞察和代谢分析。
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="border-none shadow-xl shadow-neutral-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  身体数据
                </CardTitle>
                <CardDescription>选择您的单位系统并输入您的身体基本信息。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="metric" className="w-full" onValueChange={(v) => setUnitSystem(v as UnitSystem)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="metric">公制 (kg/cm)</TabsTrigger>
                    <TabsTrigger value="imperial">英制 (lb/in)</TabsTrigger>
                  </TabsList>

                  <div className="space-y-6">
                    {/* Gender and Age */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-neutral-700">性别</Label>
                        <div className="flex p-1 bg-neutral-100 rounded-lg">
                          <button
                            onClick={() => handleGenderChange('male')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                              gender === 'male' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                            )}
                          >
                            <User className="w-4 h-4" /> 男
                          </button>
                          <button
                            onClick={() => handleGenderChange('female')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all",
                              gender === 'female' ? "bg-white text-emerald-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                            )}
                          >
                            <User className="w-4 h-4" /> 女
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium text-neutral-700">年龄</Label>
                        <Input
                          id="age"
                          type="number"
                          value={age ?? ""}
                          onChange={(e) => setAge(e.target.value === "" ? 0 : Number(e.target.value))}
                          className="bg-neutral-50 border-neutral-200 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={unitSystem}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        {unitSystem === 'metric' ? (
                          <>
                            <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <Label htmlFor="height-metric" className="text-sm font-medium text-neutral-700">身高 (cm)</Label>
                                <span className="text-2xl font-mono font-bold text-emerald-600">{(height || 0).toFixed(1)}</span>
                              </div>
                              <Slider
                                value={[Number(height) || 100]}
                                min={100}
                                max={250}
                                step={0.1}
                                onValueChange={(v) => {
                                  if (Array.isArray(v) && v.length > 0) {
                                    setHeight(Math.round(v[0] * 10) / 10);
                                  }
                                }}
                                className="py-4"
                              />
                              <Input
                                id="height-metric"
                                type="number"
                                step="0.1"
                                value={height ?? ""}
                                onChange={(e) => setHeight(e.target.value === "" ? 0 : Number(e.target.value))}
                                className="bg-neutral-50 border-neutral-200 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <Label htmlFor="weight-metric" className="text-sm font-medium text-neutral-700">体重 (kg)</Label>
                                <span className="text-2xl font-mono font-bold text-emerald-600">{(weight || 0).toFixed(1)}</span>
                              </div>
                              <Slider
                                value={[Number(weight) || 30]}
                                min={30}
                                max={200}
                                step={0.1}
                                onValueChange={(v) => {
                                  if (Array.isArray(v) && v.length > 0) {
                                    setWeight(Math.round(v[0] * 10) / 10);
                                  }
                                }}
                                className="py-4"
                              />
                              <Input
                                id="weight-metric"
                                type="number"
                                step="0.1"
                                value={weight ?? ""}
                                onChange={(e) => setWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                                className="bg-neutral-50 border-neutral-200 focus:ring-emerald-500"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="height-ft" className="text-sm font-medium text-neutral-700">身高 (英尺)</Label>
                                <Input
                                  id="height-ft"
                                  type="number"
                                  step="0.1"
                                  value={heightFt ?? ""}
                                  onChange={(e) => setHeightFt(e.target.value === "" ? 0 : Number(e.target.value))}
                                  className="bg-neutral-50 border-neutral-200"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="height-in" className="text-sm font-medium text-neutral-700">身高 (英寸)</Label>
                                <Input
                                  id="height-in"
                                  type="number"
                                  step="0.1"
                                  value={heightIn ?? ""}
                                  onChange={(e) => setHeightIn(e.target.value === "" ? 0 : Number(e.target.value))}
                                  className="bg-neutral-50 border-neutral-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-end">
                                <Label htmlFor="weight-lbs" className="text-sm font-medium text-neutral-700">体重 (磅)</Label>
                                <span className="text-2xl font-mono font-bold text-emerald-600">{(weightLbs || 0).toFixed(1)}</span>
                              </div>
                              <Slider
                                value={[Number(weightLbs) || 60]}
                                min={60}
                                max={450}
                                step={0.1}
                                onValueChange={(v) => {
                                  if (Array.isArray(v) && v.length > 0) {
                                    setWeightLbs(Math.round(v[0] * 10) / 10);
                                  }
                                }}
                                className="py-4"
                              />
                              <Input
                                id="weight-lbs"
                                type="number"
                                step="0.1"
                                value={weightLbs ?? ""}
                                onChange={(e) => setWeightLbs(e.target.value === "" ? 0 : Number(e.target.value))}
                                className="bg-neutral-50 border-neutral-200 focus:ring-emerald-500"
                              />
                            </div>
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-neutral-100 pt-6">
                <Button variant="ghost" onClick={reset} className="text-neutral-500 hover:text-neutral-900">
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  重置
                </Button>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <Info className="w-3 h-3" />
                  结果仅适用于 18 岁以上成人
                </div>
              </CardFooter>
            </Card>

            {/* Energy Balance Input */}
            <Card className="border-none shadow-xl shadow-neutral-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  每日能量平衡
                </CardTitle>
                <CardDescription>选择您的活动强度并输入摄入/运动消耗。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-neutral-700">日常活动强度 (工作类型)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACTIVITY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setActivityLevel(level.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center",
                          activityLevel === level.id
                            ? "bg-orange-50 border-orange-200 text-orange-700 ring-2 ring-orange-100"
                            : "bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200"
                        )}
                      >
                        <span className="text-xs font-bold">{level.label}</span>
                        <span className="text-[9px] opacity-60 mt-0.5">x{level.factor}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-400 italic">
                    * {ACTIVITY_LEVELS.find(l => l.id === activityLevel)?.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="intake" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-emerald-500" /> 每日摄入 (kcal)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="intake"
                        type="number"
                        value={dailyIntake ?? ""}
                        onChange={(e) => setDailyIntake(e.target.value === "" ? 0 : Number(e.target.value))}
                        className="w-24 h-8 text-right font-mono font-bold text-emerald-600"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[Number(dailyIntake) || 500]}
                    min={500}
                    max={5000}
                    step={10}
                    onValueChange={(v) => {
                      if (Array.isArray(v) && v.length > 0) setDailyIntake(v[0]);
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="expenditure" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-500" /> 额外运动消耗 (kcal)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="expenditure"
                        type="number"
                        value={extraExpenditure ?? ""}
                        onChange={(e) => setExtraExpenditure(e.target.value === "" ? 0 : Number(e.target.value))}
                        className="w-24 h-8 text-right font-mono font-bold text-orange-600"
                      />
                    </div>
                  </div>
                  <Slider
                    value={[Number(extraExpenditure) || 0]}
                    min={0}
                    max={2000}
                    step={10}
                    onValueChange={(v) => {
                      if (Array.isArray(v) && v.length > 0) setExtraExpenditure(v[0]);
                    }}
                  />
                </div>
                
                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-500">基础代谢 (BMR)</span>
                    <span className="font-medium">{bmr} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-500">日常活动加成 (x{activityFactor})</span>
                    <span className="font-medium">+{Math.round(bmr * (activityFactor - 1))} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-neutral-700">总预计消耗 (TDEE)</span>
                    <span className="text-orange-600">{totalExpenditure} kcal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 space-y-6"
          >
            {bmiResult ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BMI Card */}
                  <Card className="border-none shadow-2xl shadow-emerald-200/20 overflow-hidden">
                    <div className={cn("h-2 w-full", bmiResult.color.split(' ')[0].replace('text', 'bg'))} />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-neutral-500 text-xs font-medium uppercase tracking-wider">您的 BMI 指数</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-6">
                      <motion.div
                        key={bmiResult.bmi}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-2"
                      >
                        <span className="text-6xl font-black tracking-tighter text-neutral-900">
                          {bmiResult.bmi}
                        </span>
                      </motion.div>
                      <button 
                        onClick={() => setShowRangeDialog(true)}
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-4 transition-transform hover:scale-105 active:scale-95",
                          bmiResult.color
                        )}
                      >
                        {bmiResult.category}
                        <Info className="w-3 h-3 ml-1 opacity-60" />
                      </button>

                      <div className="relative h-3 w-full bg-neutral-100 rounded-full overflow-hidden mb-2">
                        <div className="absolute inset-0 flex">
                          <div className="h-full w-[46.25%] bg-blue-500/40 border-r border-white/50" />
                          <div className="h-full w-[13.75%] bg-emerald-500/40 border-r border-white/50" />
                          <div className="h-full w-[10%] bg-amber-500/40 border-r border-white/50" />
                          <div className="h-full flex-1 bg-rose-500/40" />
                        </div>
                        <motion.div
                          initial={{ left: 0 }}
                          animate={{ left: `${Math.min(Math.max((bmiResult.bmi - 0) / 40 * 100, 0), 100)}%` }}
                          className="absolute top-0 w-1 h-full bg-neutral-900 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-neutral-400 font-medium px-1">
                        <span>0</span>
                        <span>18.5</span>
                        <span>24</span>
                        <span>28</span>
                        <span>40+</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Body Composition Card */}
                  <Card className="border-none shadow-lg bg-white overflow-hidden">
                    <CardHeader className="pb-2 bg-neutral-50/50">
                      <CardTitle className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3 h-3" /> 可能的身体情况 (估算)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-neutral-100">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-700">体脂率 (BFP)</span>
                            <span className="text-[10px] text-neutral-400">身体脂肪所占比例</span>
                          </div>
                          <button 
                            onClick={() => setShowBfpDialog(true)}
                            className="text-sm font-mono font-bold text-rose-500 hover:underline decoration-rose-200 underline-offset-4 flex items-center gap-1 group"
                          >
                            {bodyComposition?.fat}%
                            <Info className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-700">水分含量</span>
                            <span className="text-[10px] text-neutral-400">维持细胞功能所需</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-blue-500">{bodyComposition?.water} kg</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-700">骨量估算</span>
                            <span className="text-[10px] text-neutral-400">骨骼组织的大致重量</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-amber-600">{bodyComposition?.bone} kg</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-700">肌肉量</span>
                            <span className="text-[10px] text-neutral-400">骨骼肌的大致重量</span>
                          </div>
                          <span className="text-sm font-mono font-bold text-emerald-600">{bodyComposition?.muscle} kg</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-neutral-700">内脏脂肪等级</span>
                            <span className="text-[10px] text-neutral-400">1-9 正常, 10-14 偏高, 15+ 极高</span>
                          </div>
                          <span className={cn(
                            "text-sm font-mono font-bold",
                            Number(bodyComposition?.visceral) >= 15 ? "text-rose-600" : 
                            Number(bodyComposition?.visceral) >= 10 ? "text-amber-600" : "text-emerald-600"
                          )}>
                            等级 {bodyComposition?.visceral}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-neutral-50 text-[9px] text-neutral-400 italic text-center">
                        * 以上数据基于公式估算，非医疗级测量结果
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Metabolic Summary Card */}
                <Card className="border-none shadow-xl bg-white overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-rose-400" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      代谢与能量分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                      <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                        <div className="text-[10px] text-orange-600 font-bold uppercase mb-1">基础代谢 (BMR)</div>
                        <div className="text-2xl font-black text-neutral-900">{bmr} <span className="text-xs font-normal text-neutral-400">kcal</span></div>
                        <p className="text-[10px] text-neutral-500 mt-1">维持生命所需最低热量</p>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <div className="text-[10px] text-neutral-400 font-bold uppercase mb-1">总预计消耗 (TDEE)</div>
                        <div className="text-2xl font-black text-neutral-900">{totalExpenditure} <span className="text-xs font-normal text-neutral-400">kcal</span></div>
                        <p className="text-[10px] text-neutral-500 mt-1">包含日常活动与运动</p>
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl border",
                        energyBalance > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <div className={cn(
                          "text-[10px] font-bold uppercase mb-1",
                          energyBalance > 0 ? "text-rose-600" : "text-emerald-600"
                        )}>能量平衡 (Balance)</div>
                        <div className={cn(
                          "text-2xl font-black",
                          energyBalance > 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                          {energyBalance > 0 ? `+${energyBalance}` : energyBalance} <span className="text-xs font-normal opacity-60">kcal</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">{energyBalance > 0 ? '热量盈余' : '热量缺口'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weight Change Prediction */}
                <Card className="border-none shadow-lg bg-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {energyBalance > 0 ? <TrendingUp className="w-5 h-5 text-rose-500" /> : <TrendingDown className="w-5 h-5 text-emerald-500" />}
                      体重变化预测
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                      <div className="flex-1 space-y-2">
                        <p className="text-neutral-600 text-sm leading-relaxed">
                          基于您目前的能量平衡（每日 {energyBalance > 0 ? '盈余' : '缺口'} {Math.abs(energyBalance)} kcal），
                          您的体重预计会发生以下变化：
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <button 
                            onClick={() => setProjectionType('weekly')}
                            className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-left hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-[10px] text-neutral-400 uppercase mb-1">每周变化</div>
                              <Calendar className="w-3 h-3 text-neutral-300 group-hover:text-emerald-400" />
                            </div>
                            <div className={cn("text-xl font-bold", energyBalance > 0 ? "text-rose-500" : "text-emerald-500")}>
                              {energyBalance > 0 ? '+' : ''}{(((energyBalance || 0) * 7) / 7700).toFixed(2)} kg
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-1">点击查看详情</div>
                          </button>
                          <button 
                            onClick={() => setProjectionType('monthly')}
                            className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-left hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-[10px] text-neutral-400 uppercase mb-1">每月变化</div>
                              <Calendar className="w-3 h-3 text-neutral-300 group-hover:text-emerald-400" />
                            </div>
                            <div className={cn("text-xl font-bold", energyBalance > 0 ? "text-rose-500" : "text-emerald-500")}>
                              {energyBalance > 0 ? '+' : ''}{monthlyWeightChange} kg
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-1">点击查看详情</div>
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 w-32 h-32 rounded-full border-8 border-neutral-50 flex items-center justify-center relative">
                        <div className={cn(
                          "absolute inset-0 rounded-full border-8 border-transparent border-t-current",
                          energyBalance > 0 ? "text-rose-400" : "text-emerald-400"
                        )} style={{ transform: `rotate(${Math.min(Math.abs(energyBalance) / 1000 * 180, 180)}deg)` }} />
                        <div className="text-center">
                          <div className="text-2xl font-black">{Math.abs(monthlyWeightChange)}</div>
                          <div className="text-[10px] text-neutral-400 uppercase font-bold">kg / 月</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-none shadow-lg bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        健康洞察
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-neutral-600 leading-relaxed">
                        {bmiResult.description}
                      </p>
                      <Separator className="bg-neutral-100" />
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-emerald-500" />
                          建议行动
                        </h4>
                        <ul className="space-y-2">
                          {bmiResult.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              <Card className="border-dashed border-2 border-neutral-200 bg-transparent flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                <div className="p-4 bg-neutral-100 rounded-full mb-4">
                  <Calculator className="w-8 h-8 text-neutral-400" />
                </div>
                <CardTitle className="text-neutral-400 mb-2">准备计算</CardTitle>
                <CardDescription>调整滑块或输入您的数据，查看您的 BMI 结果、基础代谢和体重变化预测。</CardDescription>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              什么是 BMI？
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              身体质量指数 (BMI) 是一个人的体重（公斤）除以身高（米）的平方。它是一种廉价且简便的体重类别筛查方法。
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              局限性
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              BMI 并不直接测量体脂。它没有考虑到肌肉量、骨密度、整体身体成分以及种族和性别差异。
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
            <h3 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-500" />
              准确性
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              虽然 BMI 是一个有用的筛查工具，但它并不是对个人体脂或健康的诊断。请咨询专业人士进行全面评估。
            </p>
          </div>
        </motion.section>

        <footer className="mt-16 text-center text-neutral-400 text-xs pb-8">
          <p>© 2026 BMI 健康计算器。仅供参考。</p>
        </footer>

        {/* Projection Dialog */}
        <Dialog open={!!projectionType} onOpenChange={(open) => !open && setProjectionType(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                {projectionType === 'weekly' ? '每周体重变化预测' : '每月体重变化预测'}
              </DialogTitle>
              <DialogDescription>
                基于您当前的能量平衡状态，未来 {projectionType === 'weekly' ? '4 周' : '6 个月'} 的预测数据。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>预计日期</TableHead>
                    <TableHead className="text-right">体重 ({unitSystem === 'metric' ? 'kg' : 'lb'})</TableHead>
                    <TableHead className="text-right">BMI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectionData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-neutral-500 text-xs">{row.date}</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {row.weight}
                        <span className={cn(
                          "text-[10px] ml-1",
                          energyBalance > 0 ? "text-rose-500" : "text-emerald-500"
                        )}>
                          ({energyBalance > 0 ? '+' : ''}{row.change})
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">{row.bmi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg text-[10px] text-neutral-500 leading-relaxed">
              提示：此预测仅基于数学计算。实际体重受水分波动、肌肉增长、代谢适应等多种复杂因素影响。建议每周固定时间测量。
            </div>
          </DialogContent>
        </Dialog>

        {/* BMI Range Dialog */}
        <Dialog open={showRangeDialog} onOpenChange={setShowRangeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                BMI 指数区间说明
              </DialogTitle>
              <DialogDescription>
                参考中国成人 BMI 分类标准，了解不同数值代表的健康状态。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="divide-y divide-neutral-100 border rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" /> 体重过轻
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-600">&lt; 18.5</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/40">
                  <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" /> 正常范围
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-700">18.5 - 23.9</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" /> 超重
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-600">24.0 - 27.9</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-neutral-600 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" /> 肥胖
                  </span>
                  <span className="text-sm font-mono font-bold text-rose-600">&ge; 28.0</span>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg text-[10px] text-neutral-400 leading-relaxed text-center">
              数据来源：《中国成人超重和胖症预防控制指南》
            </div>
          </DialogContent>
        </Dialog>

        {/* BFP Details Dialog */}
        <Dialog open={showBfpDialog} onOpenChange={setShowBfpDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-500" />
                体脂率对照表及健康影响
              </DialogTitle>
              <DialogDescription>
                了解不同体脂率对应的外观特征、身体表现及潜在的健康影响。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Tabs defaultValue={gender} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="male" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> 男性
                  </TabsTrigger>
                  <TabsTrigger value="female" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> 女性
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="female">
                  <div className="space-y-4">
                    {BFP_DATA.female.map((item, i) => (
                      <div key={i} className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300 border-neutral-100 group">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-50">
                          <div className="flex flex-col items-center sm:items-start">
                            <span className="text-3xl font-black font-mono tracking-tighter text-neutral-900 group-hover:text-rose-600 transition-colors">
                              {item.range}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">体脂率范围</span>
                          </div>
                          <div className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold border shadow-sm tracking-wide flex items-center gap-2",
                            getBfpCategoryColor(item.category)
                          )}>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            {item.category}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                              <Eye className="w-4 h-4 text-rose-400" />
                              外观与身体特征
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                              {item.features}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              健康影响
                            </div>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                              {item.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="male">
                  <div className="space-y-4">
                    {BFP_DATA.male.map((item, i) => (
                      <div key={i} className="border rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300 border-neutral-100 group">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-50">
                          <div className="flex flex-col items-center sm:items-start">
                            <span className="text-3xl font-black font-mono tracking-tighter text-neutral-900 group-hover:text-blue-600 transition-colors">
                              {item.range}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">体脂率范围</span>
                          </div>
                          <div className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold border shadow-sm tracking-wide flex items-center gap-2",
                            getBfpCategoryColor(item.category)
                          )}>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            {item.category}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                              <Eye className="w-4 h-4 text-blue-400" />
                              外观与身体特征
                            </div>
                            <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                              {item.features}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              健康影响
                            </div>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                              {item.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="bg-neutral-50 p-3 rounded-lg text-[10px] text-neutral-400 leading-relaxed">
              提示：体脂率估算仅供参考。最准确的测量方法包括双能X射线吸收法(DEXA)、水下称重法或专业的体脂夹测量。
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

