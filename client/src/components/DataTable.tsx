import React, {useEffect, useState} from 'react';
import {ArrowLeft, ArrowRight, MoreVertical} from 'react-feather';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'components/ui/table';
import {Button} from './ui/button';

/**
 * An action section to be embedded at the end of the table in the hidden menu.
 */
export type Action<T> = {
  name: string;
  icon(item: T, index: number): React.ReactNode;
  action?(item: T, index: number): void;
  tooltip?: string;
};

/**
 * Table colums which represent a section of the data.
 */
export type Section<T> = {
  name: string;
  tooltip?: string;
  containerOptions?: React.HTMLAttributes<HTMLTableCellElement>;
  display(item: T, index: number): React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  sections: Section<T>[];
  actions?: Action<T>[];
  caption?: string;
};

/**
 * A component to display some generic tabular data.
 *
 * Each row is made up of <sections[0] ... sections.[n-1]> , <?moreActions>
 * Where more actions is a menu which only appears if actions.length > 0
 */
const DataTable = <T,>({
  data,
  sections,
  actions = [],
  caption,
}: TableProps<T>) => {
  const [popupIndex, setPopupIndex] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const togglePopup = (index: number) => () => {
    setPopupIndex(index);
    setOpen(!open);
  };

  const totalPages = Math.ceil(data.length / limit);
  const startIndex = page * limit;
  const endIndex = (page + 1) * limit;
  const pageData = data.slice(startIndex, endIndex);

  const changePage = (delta: number) => {
    setPage(page => Math.min(Math.max(page + delta, 0), totalPages - 1));
  };

  useEffect(() => {
    setPage(0);
  }, [data]);

  const Paginator = () => {
    return (
      <div className="my-4 flex justify-between items-center">
        <p className="text-gray-600 text-xs">
          Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
          <span className="font-semibold">
            {Math.min(endIndex, data.length)}
          </span>{' '}
          of <span className="font-semibold">{data.length}</span> results.
        </p>
        <div className="flex items-center gap-2 text-xs">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => changePage(-1)}
            disabled={page === 0}
          >
            <ArrowLeft size={20} />
          </Button>
          <p>Page {page + 1}</p>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => changePage(+1)}
            disabled={page === totalPages - 1}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="border rounded w-full">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {sections.map(section => (
                <TableHead key={section.name}>{section.name}</TableHead>
              ))}
              {actions.length > 0 && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((item, index) => (
              <TableRow key={index}>
                {sections.map((section, sectionIndex) => (
                  <TableCell
                    key={sectionIndex}
                    {...(section.containerOptions ?? {})}
                  >
                    {section.display(item, index)}
                  </TableCell>
                ))}
                {actions.length > 0 && (
                  <TableCell className="relative text-center w-0">
                    <Button size="icon" onClick={togglePopup(index)}>
                      <MoreVertical />
                    </Button>

                    <ActionPopup
                      item={item}
                      actions={actions}
                      isOpen={index === popupIndex && open}
                      close={() => setOpen(false)}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Paginator />
    </div>
  );
};

type ActionPopupProps<T> = {
  item: T;
  isOpen: boolean;
  close: () => void;
  actions: Action<T>[];
};

const ActionPopup = <T,>({
  item,
  isOpen,
  close,
  actions,
}: ActionPopupProps<T>) => {
  if (!isOpen) return null;
  return (
    <div
      className="z-10 absolute top-1 flex flex-col bg-white border"
      onMouseLeave={close}
    >
      {actions.map((action, index) => (
        <div
          className="p-3 flex gap-2 cursor-pointer hover:bg-gray-50"
          key={index}
          onClick={() => action.action?.(item, index)}
        >
          {action.icon(item, index)}
          <span>{action.name}</span>
        </div>
      ))}
    </div>
  );
};

export default DataTable;
