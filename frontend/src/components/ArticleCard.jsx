function ArticleCard({ article }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {article.image && (
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              article.version === 'updated'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {article.version === 'updated' ? 'Enhanced' : 'Original'}
          </span>
          {article.publishedAt && (
            <span className="text-xs text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {article.excerpt}
          </p>
        )}
        {article.author && (
          <p className="text-sm text-gray-500">By {article.author}</p>
        )}
      </div>
    </div>
  )
}

export default ArticleCard

