// src/pages/TemplateEdit.jsx
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const questionTypes = [
  "single-line",
  "multi-line",
  "number",
  "checkbox",
  "dropdown",
];

const TemplateEdit = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      topic: "",
      isPublic: true,
      version: 0,
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(
          "https://forms-app-vff5.onrender.com/topics"
        );
        setTopics(res.data);
      } catch (err) {
        toast.error("Failed to load topics");
      }
    };
    fetchTopics();
  }, []);

  // Fetch existing template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const { data } = await axios.get(
          `https://forms-app-vff5.onrender.com/templates/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const template = data.template;

        // Reset form with fetched data
        reset({
          title: template.title,
          description: template.description,
          topic: template.topic._id,
          isPublic: template.isPublic,
          version: template.version,
          questions: template.questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            showInResults: q.showInResults,
          })),
        });
      } catch (error) {
        toast.error("Failed to load template.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, token, reset]);

  const onSubmit = async (data) => {
    try {
      await axios.put(
        `https://forms-app-vff5.onrender.com/templates/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Template updated successfully!");
      navigate("/templates");
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to update template.");
      }
    }
  };

  if (loading) return <p className="p-4 text-center">Loading template...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Edit Template</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="font-medium">Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full border px-3 py-2 rounded-lg"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="font-medium">Topic</label>
          <select
            {...register("topic")}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">-- Select a topic --</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" {...register("isPublic")} />
          <span>Publicly visible</span>
        </label>

        <hr className="my-4" />
        <h2 className="text-xl font-semibold text-gray-700">Questions</h2>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border p-4 rounded-lg bg-gray-50 space-y-3"
          >
            <input
              {...register(`questions.${index}.questionText`, {
                required: "Question text is required",
              })}
              placeholder="Enter question"
              className="w-full border px-3 py-2 rounded"
            />

            <select
              {...register(`questions.${index}.questionType`)}
              className="w-full border px-3 py-2 rounded"
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {["checkbox", "dropdown"].includes(
              watch(`questions.${index}.questionType`)
            ) && (
              <input
                {...register(`questions.${index}.options.0`)}
                placeholder="Option 1"
                className="w-full border px-3 py-2 rounded"
              />
            )}

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register(`questions.${index}.showInResults`)}
              />
              <span>Show in results</span>
            </label>

            <button
              type="button"
              className="text-red-500 text-sm"
              onClick={() => remove(index)}
            >
              Remove Question
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            append({
              questionText: "",
              questionType: "single-line",
              options: [],
              showInResults: false,
            })
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add Question
        </button>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg mt-6"
        >
          Update Template
        </button>
      </form>
    </div>
  );
};

export default TemplateEdit;
