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
import Model, {
  BASE_MODEL,
  DEFAULT_TRAINING_OPTIONS,
  TrainingOptions,
} from 'types/Model';
import {Label} from 'components/ui/label';
import {Switch} from 'components/ui/switch';
import Link from 'next/link';
import urls from 'lib/urls';
import {createModel} from 'lib/api/models';
import {useRouter} from 'next/router';
import {Loader} from 'lucide-react';

const NewModelPage = () => {
  const datasets = useAtomValue(datasetsAtom);
  const router = useRouter();
  const [showOptions, setShowOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const modelFormSchema = z.object({
    modelName: z.string().min(1).max(20),
    datasetName: z.string(),
    baseModel: z.string().min(1),
    samplingRate: z.number().min(1).int(),
    //Model options
    batchSize: z.number().min(1).int(),
    epochs: z.number().min(1).int(),
    learningRate: z.number().positive().max(1),
    minDuration: z.number().min(0).int(),
    maxDuration: z.number().positive().int(),
    wordDelimiterToken: z.string().min(1),
    testSize: z.number().min(0).max(1),
    freezeFeatureExtractor: z.boolean(),
  });

  const form = useForm<z.infer<typeof modelFormSchema>>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      modelName: '',
      samplingRate: 16_000,
      baseModel: BASE_MODEL,
      ...DEFAULT_TRAINING_OPTIONS,
    },
  });

  const onSubmit = async (values: z.infer<typeof modelFormSchema>) => {
    if (saving) return;
    setSaving(true);

    const {
      modelName,
      datasetName,
      samplingRate,
      baseModel,
      batchSize,
      epochs,
      learningRate,
      minDuration,
      maxDuration,
      wordDelimiterToken,
      testSize,
      freezeFeatureExtractor,
    } = values;

    const options: TrainingOptions = showOptions
      ? {
          batchSize,
          epochs,
          learningRate,
          minDuration,
          maxDuration,
          wordDelimiterToken,
          testSize,
          freezeFeatureExtractor,
        }
      : DEFAULT_TRAINING_OPTIONS;

    const model: Model = {
      modelName,
      datasetName,
      samplingRate,
      baseModel,
      options,
    };

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <section className="space-y-4">
            <FormField
              control={form.control}
              name="modelName"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Model Name</FormLabel>
                  <FormControl>
                    <Input placeholder="New Model" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="datasetName"
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

            <FormField
              control={form.control}
              name="baseModel"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Base Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
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

            <FormField
              control={form.control}
              name="samplingRate"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Sampling Rate (hz)</FormLabel>
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

            <div className="flex items-center space-x-2">
              <Switch
                id="default-training-options"
                checked={!showOptions}
                onCheckedChange={() => setShowOptions(x => !x)}
              />
              <Label htmlFor="default-training-options">
                Use default training options
              </Label>
            </div>
          </section>

          {showOptions && (
            <section className="pt-8 space-y-4">
              <h2 className="font-medium text-xl">Model Training Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="batchSize"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Batch Size</FormLabel>
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
                  name="epochs"
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
                  name="learningRate"
                  render={({field}) => (
                    <FormItem className="md:col-span-2">
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
                  name="minDuration"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Minimum Epoch Duration (s)</FormLabel>
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
                  name="maxDuration"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Maximum Epoch Duration (s)</FormLabel>
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
                  name="wordDelimiterToken"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Word Delimiter Token</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Supply a string which with to split input. Defaults to a
                        single space (&quot; &quot;).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="testSize"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Test Set Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormDescription>
                        The percentage of the dataset to reserve for testing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="freezeFeatureExtractor"
                render={({field}) => (
                  <FormItem className="flex flex-row items-center space-x-2">
                    <FormLabel>Freeze Feature Extractor</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          )}

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
