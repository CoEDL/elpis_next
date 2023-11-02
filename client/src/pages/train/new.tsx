'use client';

import React, {useState} from 'react';
import * as z from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'components/ui/form';
import {Button} from 'components/ui/button';
import {Input} from 'components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import {useAtomValue} from 'jotai';
import {datasetsAtom} from 'store';
import Model, {TrainingStatus} from 'types/Model';
import {Label} from 'components/ui/label';
import {Switch} from 'components/ui/switch';
import Link from 'next/link';
import urls from 'lib/urls';
import {createModel} from 'lib/api/models';
import {useRouter} from 'next/router';
import {Loader} from 'lucide-react';
import {
  DEFAULT_DATA_ARGS,
  DEFAULT_MODEL_ARGS,
  DEFAULT_TRAINING_ARGS,
} from 'lib/models';
import {getDefaults} from 'types/KeyInfo';
import ListInput from 'components/ListInput';
import {capitalise} from 'lib/utils';

const NewModelPage = () => {
  const datasets = useAtomValue(datasetsAtom);
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  const intervalSchema = z.union([
    z.literal('no'),
    z.literal('steps'),
    z.literal('epoch'),
  ]);

  const modelFormSchema = z.object({
    name: z.string().min(1).max(20),
    modelArgs: z.object({
      modelNameOrPath: z.string().min(1),
      tokenizerNameOrPath: z.string().optional(),
      freezeFeatureEncoder: z.boolean().optional().default(true),
      attentionDropout: z.number().min(0.0).optional(),
      activationDropout: z.number().min(0.0).optional(),
      featProjDropout: z.number().min(0.0).optional(),
      hiddenDropout: z.number().min(0.0).optional(),
      finalDropout: z.number().min(0.0).optional(),
      maskTimeProb: z.number().min(0.0).max(1).optional(),
      maskTimeLength: z.number().min(0).step(1).optional(),
      maskFeatureProb: z.number().min(0.0).max(1).optional(),
      maskFeatureLength: z.number().min(0).step(1).optional(),
      layerdrop: z.number().min(0.0).optional(),
      ctcLossReduction: z
        .union([z.literal('sum'), z.literal('mean')])
        .optional(),
      ctcZeroInfinity: z.boolean().optional(),
    }),
    isDatasetLocal: z.boolean(),
    dataArgs: z.object({
      datasetNameOrPath: z.string(),
      datasetConfigName: z.string().optional(),
      trainSplitName: z.string().optional(),
      evalSplitName: z.string().optional(),
      audioColumnName: z.string().optional(),
      textColumnName: z.string().optional(),
      maxTrainSamples: z.number().min(0).step(1).optional(),
      maxEvalSamples: z.number().min(0).step(1).optional(),
      doClean: z.boolean().optional(),
      wordsToRemove: z.string().array().optional(),
      charsToRemove: z.string().array().optional(),
      charsToExplode: z.string().array().optional(),
      doLowerCase: z.boolean().optional(),
      evalMetrics: z.string().array().optional(),
      maxDurationInSeconds: z.number().min(0).optional(),
      minDurationInSeconds: z.number().min(0).optional(),
      token: z.string().optional(),
      trustRemoteCode: z.boolean().optional(),
      unkToken: z.string().optional(),
      padToken: z.string().optional(),
      wordDelimiterToken: z.string().optional(),
      phonemeLanguage: z.string().optional(),
    }),
    trainingArgs: z.object({
      numTrainEpochs: z.number().step(1).optional(),
      learningRate: z.number().min(0).optional(),
      weightDecay: z.number().optional(),
      perDeviceTrainBatchSize: z.number().step(1).optional(),
      perDeviceEvalBatchSize: z.number().step(1).optional(),
      gradientAccumulationSteps: z.number().step(1).optional(),
      evaluationStrategy: intervalSchema,
      loggingStrategy: intervalSchema,
      saveStrategy: intervalSchema,
      maxSteps: z.number().step(1).optional(),
      warmupSteps: z.number().step(1).optional(),
      loggingSteps: z.number().step(1).optional(),
      saveSteps: z.number().step(1).optional(),
      evalSteps: z.number().step(1).optional(),
      saveTotalLimit: z.number().step(1).optional(),
      seed: z.number().step(1).optional(),
      greaterIsBetter: z.boolean().optional(),
      pushToHub: z.boolean().optional(),
      dataloaderDropLast: z.boolean().optional(),
    }),
  });

  const form = useForm<z.infer<typeof modelFormSchema>>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: '',
      isDatasetLocal: true,
      modelArgs: getDefaults(DEFAULT_MODEL_ARGS),
      dataArgs: getDefaults(DEFAULT_DATA_ARGS),
      trainingArgs: getDefaults(DEFAULT_TRAINING_ARGS),
    },
  });

  const onSubmit = async (values: z.infer<typeof modelFormSchema>) => {
    if (saving) return;
    setSaving(true);

    const model: Model = {...values, status: TrainingStatus.Waiting};

    const response = await createModel(model);
    if (response.ok) {
      router.push(urls.train.index);
    } else {
      const data = await response.json();
      console.error(data);
    }
    setSaving(false);
  };

  return (
    <section className="container space-y-4">
      <h1 className="title">Create New Model</h1>
      <div className="flex items-center space-x-2 pb-4">
        <Switch
          className="bg-fuchsia-50"
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
        ></Switch>
        <Label>Show Advanced Options</Label>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <h2 className="font-medium text-xl">Model Options</h2>

            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Model Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="New Model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelArgs.modelNameOrPath"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Base Model *</FormLabel>
                  <FormControl>
                    <Input placeholder="New Model" {...field} />
                  </FormControl>
                  <FormDescription>
                    See valid models{' '}
                    <a
                      className="underline"
                      href="https://huggingface.co/models?pipeline_tag=automatic-speech-recognition"
                    >
                      here.
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showAdvanced && (
              <div className="p-4 bg-fuchsia-50 rounded-xl space-y-8">
                <FormField
                  control={form.control}
                  name="modelArgs.tokenizerNameOrPath"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Tokenizer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="HF Tokenizer Path..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Only necessary if you want the tokenizer to differ from
                        the base model&apos;s default.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelArgs.freezeFeatureEncoder"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={v => {
                            form.resetField('dataArgs.datasetNameOrPath');
                            field.onChange(v);
                          }}
                        />
                      </FormControl>
                      <FormLabel>Freeze Feature Encoder</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="modelArgs.attentionDropout"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Attention Dropout</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.activationDropout"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Activation Dropout</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.featProjDropout"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Feat Proj Dropout</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.hiddenDropout"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Hidden Dropout</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.finalDropout"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Final Dropout</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.maskTimeProb"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Mask Time Probability</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.maskTimeLength"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Mask Time Length</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.maskFeatureProb"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Mask Feature Probability</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.maskFeatureLength"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Mask Feature Length</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelArgs.layerdrop"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Layerdrop</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelArgs.ctcLossReduction"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>CTC Loss Reduction</FormLabel>
                        <Select
                          onValueChange={(v: 'mean' | 'sum') =>
                            field.onChange(v)
                          }
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a loss reduction strategy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['mean', 'sum'].map(strategy => (
                              <SelectItem key={strategy} value={strategy}>
                                {strategy}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="modelArgs.ctcZeroInfinity"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={v => {
                            form.resetField('dataArgs.datasetNameOrPath');
                            field.onChange(v);
                          }}
                        />
                      </FormControl>
                      <FormLabel>CTC Zero Infinity</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </section>

          <section className="pt-8 space-y-4">
            <h2 className="font-medium text-xl">Data Arguments</h2>

            <FormField
              control={form.control}
              name="isDatasetLocal"
              render={({field}) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={v => {
                        form.resetField('dataArgs.datasetNameOrPath');
                        field.onChange(v);
                      }}
                    />
                  </FormControl>
                  <FormLabel>Use Local Dataset</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.getValues().isDatasetLocal ? (
              <FormField
                control={form.control}
                name="dataArgs.datasetNameOrPath"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Dataset</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a processed dataset." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {datasets.map(dataset => (
                          <SelectItem key={dataset.name} value={dataset.name}>
                            {dataset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      If no datasets appear, create a new one,{' '}
                      <Link href={urls.datasets.new}>
                        <a className="underline">here.</a>
                      </Link>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataArgs.datasetNameOrPath"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Huggingface Dataset Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>test</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataArgs.datasetConfigName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Dataset Config Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>test</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataArgs.trainSplitName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Training Split Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataArgs.evalSplitName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Eval Split Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataArgs.audioColumnName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Audio Column</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataArgs.textColumnName"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Text Column</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="dataArgs.doClean"
              render={({field}) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Clean Dataset</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.getValues().dataArgs.doClean && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataArgs.wordsToRemove"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Words to Remove</FormLabel>
                      <FormControl>
                        <ListInput
                          {...field}
                          buttonText="Add Word"
                          onAdd={word =>
                            form.setValue('dataArgs.wordsToRemove', [
                              ...(field.value ?? []),
                              word,
                            ])
                          }
                          onRemove={word =>
                            form.setValue(
                              'dataArgs.wordsToRemove',
                              (field.value ?? []).filter(
                                _word => _word !== word
                              )
                            )
                          }
                        ></ListInput>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataArgs.charsToRemove"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Characters to Remove</FormLabel>
                      <FormControl>
                        <ListInput
                          {...field}
                          buttonText="Add Character"
                          onAdd={word =>
                            form.setValue('dataArgs.charsToRemove', [
                              ...(field.value ?? []),
                              word,
                            ])
                          }
                          onRemove={word =>
                            form.setValue(
                              'dataArgs.charsToRemove',
                              (field.value ?? []).filter(
                                _word => _word !== word
                              )
                            )
                          }
                        ></ListInput>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataArgs.charsToExplode"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Characters to Explode</FormLabel>
                      <FormControl>
                        <ListInput
                          {...field}
                          buttonText="Add Character"
                          onAdd={word =>
                            form.setValue('dataArgs.charsToExplode', [
                              ...(field.value ?? []),
                              word,
                            ])
                          }
                          onRemove={word =>
                            form.setValue(
                              'dataArgs.charsToExplode',
                              (field.value ?? []).filter(
                                _word => _word !== word
                              )
                            )
                          }
                        ></ListInput>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="dataArgs.doLowerCase"
              render={({field}) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Do Lower Case</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataArgs.evalMetrics"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Evaluation Metrics</FormLabel>
                  <FormControl>
                    <ListInput
                      {...field}
                      buttonText="Add Metric"
                      onAdd={word =>
                        form.setValue('dataArgs.evalMetrics', [
                          ...(field.value ?? []),
                          word,
                        ])
                      }
                      onRemove={word =>
                        form.setValue(
                          'dataArgs.evalMetrics',
                          (field.value ?? []).filter(_word => _word !== word)
                        )
                      }
                    ></ListInput>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showAdvanced && (
              <div className="p-4 bg-fuchsia-50 rounded-xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataArgs.maxTrainSamples"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Max Training Samples</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataArgs.maxEvalSamples"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Max Eval Samples</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataArgs.minDurationInSeconds"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Min Audio Duration (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataArgs.maxDurationInSeconds"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Max Audio Duration (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataArgs.unkToken"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>UNK Token</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataArgs.padToken"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>PAD Token</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataArgs.wordDelimiterToken"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Word Delimiter Token</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Defaults to a single space.
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataArgs.phonemeLanguage"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Phoneme Language</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          The target language that should be used be passed to
                          the tokenizer for tokenization. Note that this is only
                          relevant if the model classifies the input audio to a
                          sequence of phoneme sequences.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dataArgs.token"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Huggingface Token</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </section>

          <section className="pt-8 space-y-4">
            <h2 className="font-medium text-xl">Training Arguments</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trainingArgs.numTrainEpochs"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Epochs</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingArgs.learningRate"
                render={({field}) => (
                  <FormItem className="">
                    <FormLabel>Learning Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trainingArgs.perDeviceTrainBatchSize"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Training Batch Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trainingArgs.perDeviceEvalBatchSize"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>Eval Batch Size</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {showAdvanced && (
              <div className="p-4 bg-fuchsia-50 rounded-xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="trainingArgs.gradientAccumulationSteps"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Gradient Accumulation Steps</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainingArgs.weightDecay"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Weight Decay</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(
                    ['evaluation', 'logging', 'save'] as (
                      | 'evaluation'
                      | 'logging'
                      | 'save'
                    )[]
                  ).map(strategy => (
                    <FormField
                      key={strategy}
                      control={form.control}
                      name={`trainingArgs.${strategy}Strategy`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>{capitalise(strategy)} Strategy</FormLabel>
                          <Select
                            onValueChange={(v: 'no' | 'steps' | 'epoch') =>
                              field.onChange(v)
                            }
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a loss reduction strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['no', 'steps', 'epoch'].map(strategy => (
                                <SelectItem key={strategy} value={strategy}>
                                  {strategy}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {(
                    ['max', 'warmup', 'logging', 'save', 'eval'] as (
                      | 'max'
                      | 'warmup'
                      | 'logging'
                      | 'save'
                      | 'eval'
                    )[]
                  ).map(strategy => (
                    <FormField
                      key={strategy}
                      control={form.control}
                      name={`trainingArgs.${strategy}Steps`}
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>{capitalise(strategy)} Steps</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <FormField
                    control={form.control}
                    name="trainingArgs.saveTotalLimit"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Save Total Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainingArgs.seed"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Seed</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="trainingArgs.greaterIsBetter"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Greater is Better</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/*
                <FormField
                  control={form.control}
                  name="trainingArgs.pushToHub"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Push to Hub</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                */}
                <FormField
                  control={form.control}
                  name="trainingArgs.dataloaderDropLast"
                  render={({field}) => (
                    <FormItem className="flex flex-row items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Dataloader Drop Last</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </section>

          <Button type="submit" className="mt-8" disabled={saving}>
            {saving && <Loader className="mr-2 animate-spin" />}
            {saving ? 'Saving' : 'Submit'}
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default NewModelPage;
