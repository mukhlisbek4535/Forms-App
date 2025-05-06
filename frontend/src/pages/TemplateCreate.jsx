import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import TagSelector from "../../components/TagSelector";
import { useEffect, useState } from "react";
import API from "../api/axios.js";

const questionTypes = [
  "single-line",
  "multi-line",
  "number",
  "checkbox",
  "dropdown",
];

const TemplateCreate = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [topicError, setTopicError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      topic: "",
      isPublic: true,
      tags: [],
      questions: [
        {
          questionText: "",
          questionType: "single-line",
          options: [],
          showInResults: false,
        },
        {
          questionText: "haha",
          questionType: "checkbox",
          options: ["sasha"],
          showInResults: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  // 📡 Fetch topics from backend on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await API.get(
          "/topics"
          // "https://forms-app-vff5.onrender.com/topics"
        );
        setTopics(res.data);
      } catch (err) {
        setTopicError("Failed to load topics");
      } finally {
        setLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  const onSubmit = async (data) => {
    try {
      const res = await API.post(
        "/templates",
        // "https://forms-app-vff5.onrender.com/templates",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Template created successfully!");
      navigate("/templates");
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Create a New Template
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Fields */}
        <div>
          <label className="font-medium">Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full border px-3 py-2 rounded-lg"
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
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
          {loadingTopics ? (
            <p className="text-sm text-gray-500">Loading topics...</p>
          ) : topicError ? (
            <p className="text-red-500">{topicError}</p>
          ) : (
            <select
              {...register("topic", { required: "Topic is required" })}
              className="w-full border px-3 py-2 rounded-lg"
            >
              <option value="">-- Select a topic --</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  {topic.name}
                </option>
              ))}
            </select>
          )}
          {errors.topic && (
            <p className="text-red-500">{errors.topic.message}</p>
          )}
        </div>

        <label className="flex items-center space-x-2">
          <input type="checkbox" {...register("isPublic")} />
          <span>Publicly visible</span>
        </label>
        <div>
          <TagSelector
            value={watch("tags")}
            onChange={(tags) => {
              setValue("tags", tags);
            }}
          />
        </div>

        <hr className="my-4" />

        <h2 className="text-xl font-semibold text-gray-700">Questions</h2>

        {/* Render Question Fields */}
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

            {/* Only show options if type is checkbox or dropdown */}
            {["checkbox", "dropdown"].includes(
              watch(`questions.${index}.questionType`)
            ) && (
              <input
                {...register(`questions.${index}.options.0`)}
                placeholder="Option 1"
                className="w-full border px-3 py-2 rounded"
              />
              // For now we only show one option to keep it simple — we’ll improve later
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
          Create Template
        </button>
      </form>
    </div>
  );
};

export default TemplateCreate;
